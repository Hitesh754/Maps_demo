# Meridian Backend Module Boundaries & Package Architecture

**Document Version:** 1.0.0  
**Status:** Approved  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

---

## 1. Modular Monolith Directory Structure

The Meridian backend is implemented within a single Go module (`meridian/backend`; a remote can be added later). All business logic resides strictly under `internal/`:

```
backend/
├── cmd/
│   ├── api/                  # REST API server, WebSocket hub, outbox relay
│   ├── worker-events/        # Observation deduplication, signal fusion
│   ├── worker-analytics/     # H3 cell aggregation rollups
│   └── worker-media/         # EXIF extraction, sanitization, WebP conversion
├── internal/
│   ├── platform/             # Database pool, logging, config, metrics, errors
│   ├── auth/                 # Users, sessions, passwords, JWT, API keys
│   ├── spatial/              # PostGIS helpers, H3 bindings, geometry conversions
│   ├── events/               # Canonical geo_events, confirmations, state machine
│   ├── reports/              # Raw observation ingestion, deduplication orchestrator
│   ├── media/                # Presigned URLs, S3 storage client, EXIF parser
│   ├── search/               # Bounding box spatial search, geocoder adapters
│   ├── routing/              # Valhalla HTTP client, route hazard annotator
│   ├── analytics/            # H3 stats queries, heatmap generator
│   ├── layers/               # Vector tile server (ST_AsMVT), dynamic map styling
│   ├── geofence/             # Watch area polygons, proximity triggers
│   ├── inference/            # ML inference adapters, stub implementations
│   └── realtime/             # WebSocket connection hub, NATS core fanout
└── api/
    └── openapi/              # Canonical OpenAPI 3.0.3 contract
```

---

## 2. Allowed Import Matrix

To prevent circular dependencies and spaghetti coupling, package imports are strictly regulated. A module row may only import packages marked with **✓**:

| Module | `platform` | `spatial` | `auth` | `media` | `inference` | `events` | `reports` | `search` | `routing` | `analytics` | `layers` | `geofence` | `realtime` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`platform`** | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`spatial`** | ✓ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`auth`** | ✓ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`media`** | ✓ | ✗ | ✓ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`inference`** | ✓ | ✗ | ✗ | ✓ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`events`** | ✓ | ✓ | ✓ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`reports`** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`search`** | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | — | ✗ | ✗ | ✗ | ✗ | ✗ |
| **`routing`** | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | — | ✗ | ✗ | ✗ | ✗ |
| **`analytics`** | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | — | ✗ | ✗ | ✗ |
| **`layers`** | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✓ | — | ✗ | ✗ |
| **`geofence`** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | — | ✗ |
| **`realtime`** | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | — |

*Note: Application commands (`cmd/*`) act as the composition root and may import all internal packages.*

---

## 3. Cross-Module Communication Rules

1. **Synchronous Internal Calls:** Must occur through **Go interfaces** defined in the consuming package. For example, `reports` defines an `EventService` interface; `events` provides the concrete implementation injected at startup in `cmd/api/main.go`.
2. **Asynchronous Cross-Module Calls:** Operations that do not require transactional atomicity must communicate via **NATS JetStream events**. For example, when `reports` commits an observation, `worker-events` receives an event rather than being invoked synchronously.
3. **Database Boundary & SQL Independence:**
   - **No Cross-Module Table Joins:** A query in `internal/reports` must not join directly with `geo_events` tables. Queries are bounded by their domain context.
   - Modules own their database tables. Only `events` executes queries against `geo_events`, `event_signals`, and `event_history`.

---

## 4. SQL Engine Separation: `sqlc` vs Hand-Written `pgx`

Meridian adopts a deliberate division between automated SQL generation and hand-optimized spatial queries:

### 4.1. When to Use `sqlc` (Plain CRUD):
- Standard relational operations on entities: `users`, `sessions`, `api_keys`, `event_types`, `media_assets`, `notifications`, `outbox`, and `processed_messages`.
- `sqlc` compiles type-safe Go structs and query methods directly from annotated SQL files (`internal/db/queries/*.sql`), eliminating manual struct mapping and catching SQL syntax errors at compile time.

### 4.2. When to Use Hand-Written `pgx` Native Queries:
- **Spatial Queries:** Operations utilizing PostGIS functions: `ST_DWithin`, `ST_MakeEnvelope`, `ST_Distance`, and `ST_AsMVT`.
- **Dynamic Filtering:** Viewport queries with variable bounding boxes, dynamic H3 resolution grouping, and multi-parameter filters.
- `sqlc` lacks complete native typing for PostGIS binary geometry types (`GEOMETRY`) and complex CTEs. Hand-written queries use `pgxpool.Pool` directly with parameterized arguments.

---

## 5. Boundary Enforcement & Automated Verification

Module boundaries are enforced automatically in CI using `golangci-lint` configured with the **`depguard`** linter:

```yaml
# .golangci.yml (Enforced in Prompt 02)
linters-settings:
  depguard:
    rules:
      main:
        files:
          - $all
        deny:
          - pkg: "meridian/backend/internal/reports"
            in: "meridian/backend/internal/platform"
            desc: "Platform package must not import domain logic"
          - pkg: "meridian/backend/internal/events"
            in: "meridian/backend/internal/spatial"
            desc: "Spatial package must remain a pure utility without domain dependencies"
```
CI builds fail immediately if an unauthorized import is introduced.
