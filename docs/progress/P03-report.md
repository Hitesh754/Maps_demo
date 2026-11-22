# Phase Report: Prompt 03 — Region Data Pipeline and Basemap Tiles

**Date:** 2026-11-23  
**Status:** COMPLETE (All criteria met and verified)  
**Host Environment:** Windows 11 AMD64 (8 GB RAM), Go 1.27.4, Docker Desktop 29.9.3 (WSL2), Node.js v22.15.1, pnpm 10.6.0  
**Target Region:** Vadodara, Gujarat, India (`vadodara`)  
**Data Vintage:** 2026-11-22T08:07:36Z (Geofabrik Western Zone)  

---

## 1. Executive Summary

Prompt 03 delivered the complete, reproducible regional geospatial data pipeline and self-hosted basemap infrastructure for Project Meridian:
1. **Region Configuration (`config/region.json`):** Dedicated configuration defining the target area (Vadodara, Gujarat, India, BBOX: `[73.11, 22.24, 73.28, 22.37]`), center `[73.1812, 22.3072]`, default zoom 12, zoom range 0–14, and admin boundaries default off (`showAdminBoundaries: false`).
2. **Dual-Language Invariant Validation:**
   - TypeScript: Zod schema in `packages/contracts/src/region.ts` with 6 unit tests in `packages/contracts/tests/region.test.ts`.
   - Go: Native loader and validator in `backend/internal/platform/region` with 8 unit tests in `region_test.go`.
   - Standalone CLI validation script: `pnpm region:validate`.
3. **Data Acquisition & Integrity Verification (`scripts/region/acquire.mjs`):**
   - Automatically queried Geofabrik machine-readable index (`index-v1.json`).
   - Selected smallest published extract containing region (`western-zone-latest.osm.pbf`, 212.4 MB).
   - Verified against published MD5 (`69f51e34d053c4212e73ef466e4ca4a1`).
   - Created audit manifest at `data/region/manifest.json`.
4. **Context Buffer Clipping (`scripts/region/clip.mjs`):**
   - Clipped extract using `stefda/osmium-tool:latest` in Docker to `[73.06, 22.19, 73.33, 22.42]` (0.05° ~ 5.5 km buffer for routing and geocoding context).
   - Produced `data/region/vadodara.osm.pbf` (2.80 MB), preserved for Valhalla (Prompt 24) and Nominatim (Prompt 12).
5. **Basemap PMTiles Compilation (`scripts/region/build-pmtiles.mjs`):**
   - Compiled OpenMapTiles profile via `ghcr.io/onthegomap/planetiler:latest` in Docker.
   - Constrained to `-Xmx3g` JVM heap; completed in **27.8s** with **2.04 MB** output size (233 tiles across zooms 0–14).
6. **Tile Server & Static Map Assets (`infra/compose/docker-compose.yml`):**
   - Profile `tiles` with `protomaps/go-pmtiles:latest` serving on `127.0.0.1:8082` (Z/X/Y vector tiles + TileJSON 3.0.0 with CORS).
   - Static asset server `nginx:alpine` serving on `127.0.0.1:8083` for immutable Noto Sans PBF glyphs.
7. **Map Style Package (`packages/map-style`):**
   - Pure function `buildStyle({ theme, tilesBaseUrl, assetsBaseUrl, options })`.
   - Original cartographic identity with light/dark palettes, road hierarchy, building footprints at z13+, landuse, and conditional admin boundaries.
   - Validated against official `@maplibre/maplibre-gl-style-spec` with 6 unit tests.
8. **Decoded Tile Verification (`scripts/region/verify-tiles.mjs`):**
   - Real vector tile decoding at region center for zooms 0, 6, 10, 14 using `@mapbox/vector-tile` and `pbf`.
   - Verified layers (`transportation`, `building`, `place`, `water`, `landuse`, `waterway`, etc.) and feature counts.
   - Generated layer inventory in `docs/data/tile-layer-inventory.md`.
9. **Attribution, Legal Compliance & NOTICE:**
   - Root `NOTICE` file containing ODbL 1.0, OpenMapTiles CC-BY 4.0, Planetiler Apache-2.0, Noto Sans OFL 1.1, and MapLibre BSD-3-Clause licenses.
   - Exported `MAP_ATTRIBUTION_HTML` and `MAP_ATTRIBUTION_TEXT` constants.
   - Detailed attribution policy in `docs/data/attribution.md`.
10. **Developer Preview Harness (`tools/map-preview/index.html`):**
    - Standalone interactive map viewer supporting light/dark theme toggle, live coordinates/zoom readout, "Fit Region" camera animation, and layer toggles.

---

## 2. Directory Structure Delivered

```
RoadSenseAI/
├── NOTICE
├── assets/
│   └── map/
│       └── glyphs/
│           ├── Noto Sans Bold/
│           │   └── 0-255.pbf
│           └── Noto Sans Regular/
│               └── 0-255.pbf
├── backend/
│   └── internal/
│       └── platform/
│           └── region/
│               ├── region.go
│               └── region_test.go
├── config/
│   └── region.json
├── docs/
│   └── data/
│       ├── attribution.md
│       ├── region.md
│       └── tile-layer-inventory.md
├── infra/
│   └── compose/
│       ├── docker-compose.yml (updated with "tiles" profile)
│       └── nginx-map-assets.conf
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   │   └── region.ts
│   │   └── tests/
│   │       └── region.test.ts
│   └── map-style/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── attribution.ts
│       │   ├── builder.ts
│       │   ├── index.ts
│       │   └── types.ts
│       └── tests/
│           └── style.test.ts
├── scripts/
│   └── region/
│       ├── acquire.mjs
│       ├── build-pmtiles.mjs
│       ├── build-region.ps1
│       ├── clip.mjs
│       ├── validate-region.mjs
│       └── verify-tiles.mjs
└── tools/
    └── map-preview/
        └── index.html
```

---

## 3. Measured Pipeline Resource Performance

| Step | Container / Process | Elapsed Time | Memory / Heap Used | Output File & Size |
|---|---|---|---|---|
| **Resource Check** | `scripts/windows/check-resources.ps1` | 1.2s | < 30 MB | RAM: 7.69 GB total / Free disk: 32.6 GB |
| **Extract Acquisition** | `scripts/region/acquire.mjs` | 42.1s | < 50 MB | `data/raw/western-zone-latest.osm.pbf` (212.4 MB) |
| **MD5 Checksum** | Node.js `crypto.createHash` | 0.8s | < 30 MB | Checksum verified: `69f51e34d053c4212e73ef466e4ca4a1` |
| **Osmium Clip** | `stefda/osmium-tool:latest` | 1.5s | < 80 MB | `data/region/vadodara.osm.pbf` (2.80 MB) |
| **Planetiler Basemap** | `ghcr.io/onthegomap/planetiler:latest` | 27.8s | JVM `-Xmx3g` (heap ~1.2 GB) | `data/tiles/vadodara.pmtiles` (2.04 MB, 233 tiles) |
| **Tile Verification** | `scripts/region/verify-tiles.mjs` | 2.4s | < 50 MB | Real decoded vector tiles across zooms 0, 6, 10, 14 |

---

## 4. Tile Layer Inventory Summary

From `docs/data/tile-layer-inventory.md`:

| Vector Layer ID | Min Zoom | Max Zoom | Key Attributes / Fields |
|---|---|---|---|
| `water` | 0 | 14 | `class`, `id`, `intermittent` |
| `waterway` | 4 | 14 | `class`, `name`, `brunnel`, `intermittent` |
| `landuse` | 5 | 14 | `class` |
| `landcover` | 12 | 14 | `class`, `subclass` |
| `building` | 13 | 14 | `colour`, `hide_3d`, `render_height`, `render_min_height` |
| `transportation` | 4 | 14 | `class`, `subclass`, `service`, `surface`, `toll`, `oneway`, `ramp`, `brunnel` |
| `transportation_name` | 8 | 14 | `class`, `name`, `network`, `ref`, `route_1_name` |
| `place` | 4 | 14 | `class`, `name`, `capital`, `rank` |
| `poi` | 12 | 14 | `class`, `subclass`, `name`, `rank`, `indoor`, `level` |
| `boundary` | 9 | 14 | `admin_level`, `disputed`, `maritime` |
| `aeroway` | 10 | 14 | `class`, `ref` |
| `aerodrome_label` | 10 | 14 | `class`, `iata`, `icao`, `name`, `ele` |
| `housenumber` | 14 | 14 | `housenumber` |
| `water_name` | 14 | 14 | `class`, `name`, `intermittent` |

---

## 5. Live Tile Server & Asset Verification

```powershell
node scripts/region/verify-tiles.mjs
```
Trimmed output:
```
==========================================================
Verifying Basemap Vector Tiles for Region: Vadodara, Gujarat, India
Tile Server: http://127.0.0.1:8082 | Assets Server: http://127.0.0.1:8083
==========================================================

1. Verifying PMTiles archive header via go-pmtiles...
pmtiles spec version: 3
tile type: mvt
bounds: (long: 73.060000, lat: 22.190000) (long: 73.330000, lat: 22.420000)
min zoom: 0
max zoom: 14
center: (long: 73.195000, lat: 22.305000)
center zoom: 11
addressed tiles count: 233
clustered: true

2. Verifying TileJSON endpoint at http://127.0.0.1:8082/vadodara.json...
   HTTP 200 OK | Content-Type: application/json | CORS: *
   Discovered 14 vector layers in TileJSON.
   Written layer inventory to docs/data/tile-layer-inventory.md

3. Fetching and decoding vector tiles at region center...
   [Zoom 0] Tile 0/0/0 (7789 bytes):
      Layers (1): water
      Total Features: 1
   [Zoom 6] Tile 6/45/27 (938 bytes):
      Layers (2): place, transportation
      Total Features: 3
   [Zoom 10] Tile 10/720/446 (12378 bytes):
      Layers (9): aerodrome_label, aeroway, boundary, landuse, place, transportation, transportation_name, water, waterway
      Total Features: 66
   [Zoom 14] Tile 14/11522/7150 (50421 bytes):
      Layers (12): boundary, building, housenumber, landcover, landuse, place, poi, transportation, transportation_name, water, water_name, waterway
      Total Features: 565
   [PASS] All expected core layers (transportation, building, place, water) present at z14.

4. Verifying out-of-region tile request...
   Out-of-region (14/0/0.mvt) returned HTTP 204 (expected 204 or 404)
   [PASS] Out-of-region tile properly rejected.

5. Verifying static map assets server on port 8083...
   HTTP 200 OK | Content-Length: 76580 bytes
   Cache-Control: public, max-age=31536000, immutable | CORS: *
   [PASS] Static assets server operational.

==========================================================
ALL TILE & ASSET VERIFICATION CHECKS PASSED!
==========================================================
```

---

## 6. Monorepo Quality Gates Log (`pnpm verify`)

- Total Tasks: 20 (across 6 packages and applications)
- Status: **20/20 Successful**
- Region Validation: **Passed**
- `@meridian/contracts` (11 tests): **Passed**
- `@meridian/map-style` (6 tests): **Passed**
- `@meridian/design-tokens` (2 tests): **Passed**
- `@meridian/api-client` (5 tests): **Passed**
- `apps/web` (readiness test + next build): **Passed**
- `backend` Go Vet: **Passed**
- `backend` Go Race Unit Tests: **Passed** (`internal/platform/config`, `internal/platform/health`, `internal/platform/region`)
- `backend` Go Build (`cmd/api`): **Passed**
