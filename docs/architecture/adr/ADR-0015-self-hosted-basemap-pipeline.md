# ADR-0015: Self-Hosted Basemap Pipeline (Planetiler, PMTiles, go-pmtiles)

## Context
Commercial basemap providers (Mapbox, Google, Stadia) charge prohibitive recurring usage fees, impose vendor-locked SDKs, and enforce terms restricting offline vector caching. Relying on public OpenStreetMap tile servers (`tile.openstreetmap.org`) for an application violates OSM Foundation Acceptable Use Policies and risks IP bans. Meridian requires a sovereign, offline-capable, cost-free vector basemap pipeline.

## Decision
We implement an autonomous, self-hosted vector basemap pipeline:

1. **Extraction:** OpenStreetMap raw data extracts are acquired as `.osm.pbf` files from Geofabrik for the configured target region.
2. **Tile Generation (Planetiler):**
   - Planetiler compiles the `.osm.pbf` extract into a single, compact **PMTiles** archive (`planetiler.pmtiles`) using the OpenMapTiles vector tile schema.
   - The host machine has OpenJDK 25 LTS installed; Planetiler executes with memory bounded to `-Xmx2g` for city extracts.
   - Generation is executed as an **offline batch step** prior to starting live API services.
3. **Tile Serving (`go-pmtiles`):**
   - We deploy `go-pmtiles` (v1.31.2, BSD-3-Clause) as a lightweight HTTP micro-service listening on port `8082`.
   - `go-pmtiles` reads the single `planetiler.pmtiles` file from local disk or S3 and serves standard vector tiles over HTTP:
     ```
     GET /v1/tiles/{z}/{x}/{y}.mvt
     ```
   - It supports HTTP Byte-Range requests, gzip/brotli compression, and immutable cache headers.
4. **Client Rendering:** Web (MapLibre GL JS) and Mobile (MapLibre React Native) consume vector tiles directly from this self-hosted endpoint.

## Alternatives considered
- **PostGIS ST_AsMVT for Basemaps:** Rejected because dynamically generating millions of basemap geometry tiles on the fly from PostgreSQL destroys database CPU. Static PMTiles files serve tiles in sub-millisecond response times.
- **TileServer GL / Node.js Tile Services:** Rejected due to excessive memory consumption and Node.js process instability compared to single-binary Go `go-pmtiles`.

## Consequences
- **Positive:** Zero external API cost, complete offline capability, sub-millisecond tile serving latency, total visual control over map styling.
- **Negative:** Updating map data requires regenerating the `.pmtiles` archive and reloading the tile server.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (`go-pmtiles` v1.31.2, Planetiler, OpenMapTiles)
- Protomaps PMTiles Specification: `https://protomaps.com/docs/pmtiles`

## Status
Approved
