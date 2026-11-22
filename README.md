# Meridian — Geospatial Intelligence Platform

Meridian is a high-performance, modular geospatial intelligence platform providing reusable spatial infrastructure: interactive vector maps, spatial search, H3 hexagonal hierarchical indexing and aggregation, real-time geographic events, road-network intelligence, routing, and AI-assisted road condition observations.

> **Target Scope:** Navigation is **one** application of this platform. Meridian is targeted for a configured regional extract (e.g. Vadodara / single-city benchmark extract < 100 MB OSM PBF) rather than global planet routing.

---

## Architecture Overview

```
                      +-----------------------------+
                      |      Next.js Web Client     |
                      |   (App Router + Tailwind)   |
                      +--------------+--------------+
                                     |
+--------------------------+         |         +--------------------------+
|    Expo Mobile Client    +---------+---------+   External Spatial APIs  |
|  (Expo Router + SDK 57)  |         |         | (QGIS, SDKs, CLI tools)  |
+--------------------------+         |         +--------------------------+
                                     v
                 +---------------------------------------+
                 |            Go REST API                |
                 |      (chi, slog, pgx, OpenAPI)        |
                 +----+--------------+--------------+----+
                      |              |              |
                      v              v              v
            +------------------+  +------+  +-----------------+
            | PostgreSQL 17 +  |  | NATS |  |  S3 Compatible  |
            |   PostGIS 3.7    |  |  JS  |  |     Storage     |
            +------------------+  +------+  +-----------------+
```

---

## Machine Prerequisites

Per `docs/recon/environment.md`:

| Requirement | Pinned / Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 (64-bit), macOS, or Linux | Host platform |
| **Git** | 2.50+ | Version control (enforcing LF endings via `.gitattributes`) |
| **Node.js** | 22.x LTS (tested with `22.15.1`) | Monorepo runtime |
| **pnpm** | `10.6.0` (or `12.x`) | Monorepo package manager |
| **Go** | Go `1.24+` (tested with `1.27.4`) | Backend API & spatial worker services |
| **Docker Engine & Compose** | Docker 27+ / Compose v2.30+ | Local PostgreSQL, NATS, and S3 containers |

---

## Port Allocation Table

All development services bind to `127.0.0.1` by default to avoid unintended network exposure:

| Port | Service | Protocol | Description |
| :--- | :--- | :--- | :--- |
| **8080** | Go Backend API | HTTP | REST API (`/healthz`, `/readyz`, `/v1/*`) |
| **3000** | Next.js Web App | HTTP | Interactive Web GIS application |
| **5432** | PostgreSQL + PostGIS | TCP | Geospatial relational database (PostGIS 17) |
| **4222** | NATS JetStream | TCP | Messaging broker & event streaming |
| **8222** | NATS Monitoring | HTTP | NATS broker HTTP monitoring dashboard (`/varz`) |
| **9000** | MinIO / S3 Storage | HTTP | S3 object storage API |
| **9001** | MinIO Web Console | HTTP | S3 object storage web browser console |
| **8081** | Metro Bundler | HTTP | React Native / Expo development bundler |
| **8083** | Nominatim Geocoder | HTTP | Geocoding service (shifted from 8081 to avoid Metro collision) |
| **8082** | go-pmtiles | HTTP | Vector tile server for Planetiler PMTiles |
| **8002** | Valhalla | HTTP | Routing engine (added in Prompt 04) |

---

## Quick Start (Fresh Clone to Green)

Follow these exact steps from a clean clone:

```powershell
# 1. Install monorepo dependencies
pnpm install --frozen-lockfile

# 2. Configure environment defaults
Copy-Item .env.example .env

# 3. Bring up the Docker Compose dev stack (PostGIS, NATS, MinIO, Migration, API)
pnpm dev:stack

# 4. Verify system readiness
curl http://127.0.0.1:8080/readyz
# Returns: {"status":"ok","timestamp":"...","checks":{"postgres":true,"nats":true,"s3":true}}

# 5. Run all monorepo quality gates (lint, typecheck, unit tests, web build)
pnpm verify

# 6. Run the end-to-end Compose smoke test
powershell -ExecutionPolicy Bypass -File ./scripts/smoke.ps1
```

---

## Running Applications

### Start the Next.js Web App
```powershell
pnpm dev:web
# Open http://localhost:3000 in your browser
```

### Start the Expo Mobile Client
```powershell
pnpm dev:mobile
# Press 'a' for Android emulator, 'w' for Web, or scan QR with Expo Go / Dev Client
```

---

## Region Data Pipeline & Basemap Vector Tiles (Prompt 03)

Meridian generates and self-hosts its own vector basemap from OpenStreetMap data using Planetiler and `go-pmtiles`:

```powershell
# 1. Validate region configuration
pnpm region:validate

# 2. Acquire OSM extract, clip context buffer, and build PMTiles archive
pnpm region:build

# 3. Start Tile Server (port 8082) & Map Assets Server (port 8083)
pnpm dev:stack:tiles

# 4. Verify vector tiles and decoded layers at center across zooms (z0, z6, z10, z14)
pnpm region:verify

# 5. Launch developer basemap preview harness
# Open tools/map-preview/index.html in any modern browser
```

> **Mobile Network Note:**
> - **Android Emulator:** Uses `http://10.0.2.2:8080` to communicate with the host API.
> - **iOS Simulator:** Uses `http://127.0.0.1:8080`.
> - **Physical Devices:** Set `EXPO_PUBLIC_API_BASE_URL=http://<YOUR_LAN_IP>:8080` in `.env.local`.

---

## Troubleshooting

### 1. Port 8081 Conflict (Metro vs Nominatim)
By default, React Native Metro binds to `8081`. To prevent collision, Meridian's Nominatim geocoder service is assigned to port `8083` in `docker-compose.yml`.

### 2. Docker Desktop Memory Limits on 8 GB RAM Machines
On Windows 11 with 8 GB physical RAM, Docker Desktop / WSL2 can consume excessive memory. Ensure `%USERPROFILE%\.wslconfig` contains:
```ini
[wsl2]
memory=4GB
processors=4
swap=4GB
```

### 3. CRLF / LF Line Endings on Windows
All git checkouts enforce Unix LF line endings via `.gitattributes` (`* text=auto eol=lf`). Ensure shell scripts inside containers are not converted to CRLF.

### 4. Database Volume Reset
To completely purge and re-initialize local database and storage volumes:
```powershell
pnpm dev:stack:reset -- --force
```
