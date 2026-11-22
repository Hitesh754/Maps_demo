# ADR-0001: Modular Monolith Architecture

## Context
Meridian requires a backend architecture capable of handling high-throughput spatial queries, real-time WebSocket fanout, asynchronous event processing, and machine learning inference coordination. Microservice architectures introduce high operational overhead, distributed transaction complexity, network serialization costs, and deployment friction that are unnecessary and counterproductive for single-server or Docker Compose developer environments. Conversely, an unstructured monolith risks code entanglement and unmanageable dependencies.

## Decision
We adopt a **modular monolith** in Go within a single Go module (`meridian/backend`; a remote can be added later).
1. The codebase is organized into isolated domain packages under `internal/<module>` (`platform`, `auth`, `spatial`, `events`, `reports`, `media`, `search`, `routing`, `analytics`, `layers`, `geofence`, `inference`, `realtime`).
2. Two deployable binary entry points are maintained under `cmd/`:
   - `cmd/api`: The HTTP REST API server, WebSocket hub, and transactional outbox relay.
   - `cmd/worker-*` (e.g. `cmd/worker-events`, `cmd/worker-analytics`): Asynchronous background workers consuming NATS JetStream event streams.
3. Modules communicate in-process strictly through defined Go interfaces or asynchronously via NATS JetStream events. Direct cross-module SQL table joins across bounded contexts are prohibited.

## Alternatives considered
- **Microservices Architecture:** Rejected due to excessive container orchestration complexity, distributed tracing overhead, and high RAM footprint that would exceed the 8 GB developer machine limit identified in `docs/recon/environment.md`.
- **Single Process Monolith (No Separate Workers):** Rejected because long-running analytical rollups and asynchronous inference tasks must be horizontally scalable and capable of restarting without interrupting live API traffic and WebSocket connections.

## Consequences
- **Positive:** Single repository, unified database migrations, zero network latency for internal module calls, trivial local developer workflow via Docker Compose, low memory footprint.
- **Negative:** Requires rigorous enforcement of package import boundaries via linting rules to prevent architectural erosion.

## Evidence/links
- `docs/recon/environment.md` (Host memory budget constraints)
- `docs/architecture/module-boundaries.md` (Package import rules)

## Status
Approved
