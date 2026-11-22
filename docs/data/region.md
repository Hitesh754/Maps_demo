# Region Specification, Data Pipeline & Operations Runbook

**Platform:** Meridian Geospatial Intelligence Platform  
**Target Region:** Vadodara, Gujarat, India (`vadodara`)  
**Country Code:** `IN`  
**Configuration File:** `config/region.json`  

---

## 1. Region Metadata & Coordinates

| Parameter | Value | Description |
|---|---|---|
| **Name** | Vadodara, Gujarat, India | Metropolitan municipal area |
| **Slug** | `vadodara` | Lowercase URL / filename identifier |
| **Country Code** | `IN` | ISO 3166-1 alpha-2 |
| **Visible Bounding Box** | `[73.11, 22.24, 73.28, 22.37]` | `[west, south, east, north]` (EPSG:4326) |
| **Context Buffer** | `0.05°` (~5.5 km) | Bounding box buffer for routing & geocoding context |
| **Buffered Bounding Box** | `[73.06, 22.19, 73.33, 22.42]` | Clip boundary applied to raw OSM extract |
| **Map Center** | `[73.1812, 22.3072]` | `[lng, lat]` (EPSG:4326) |
| **Default Zoom** | `12` | Initial interactive map zoom level |
| **Zoom Bounds** | `0 – 14` | Supported vector tile levels in PMTiles archive |
| **Admin Boundaries** | `false` (default) | Administrative boundary lines hidden pending legal review |

---

## 2. Upstream Data Source & Verification

- **Provider:** Geofabrik GmbH (`https://download.geofabrik.de`)
- **Extract Name:** Western Zone (`western-zone-latest.osm.pbf`)
- **Published Extract Size:** 222,718,593 bytes (212.4 MB)
- **Published MD5 Checksum:** `69f51e34d053c4212e73ef466e4ca4a1`
- **Data Vintage:** `2026-11-22T08:07:36Z`
- **License:** Open Database License (ODbL) 1.0

---

## 3. Generated Local Artifacts

| Artifact Path | Format | Size | Purpose |
|---|---|---|---|
| `data/raw/western-zone-latest.osm.pbf` | OSM PBF | 212.4 MB | Upstream regional raw extract |
| `data/region/vadodara.osm.pbf` | OSM PBF | 2.80 MB | Clipped extract preserved for Valhalla (P24) and Nominatim (P12) |
| `data/tiles/vadodara.pmtiles` | PMTiles v3 | 2.04 MB | Basemap vector tile archive (233 tiles, zooms 0–14) |
| `data/region/manifest.json` | JSON | 1.3 KB | Machine-readable provenance and audit manifest |

---

## 4. Measured Resource & Execution Metrics

Measurements captured on Windows 11 host (AMD64, 8 GB Physical RAM budget):

| Step | Tool / Container | Duration | Peak Memory / Heap | Output Size |
|---|---|---|---|---|
| **Acquisition & MD5** | Node.js fetch + crypto | 42.1s | < 50 MB | 212.4 MB raw PBF |
| **Clipping** | `stefda/osmium-tool:latest` | 1.5s | < 80 MB | 2.80 MB clipped PBF |
| **Basemap Compilation** | `ghcr.io/onthegomap/planetiler:latest` | 27.8s | JVM `-Xmx3g` (heap used ~1.2 GB) | 2.04 MB PMTiles (233 tiles) |
| **Tile Verification** | `protomaps/go-pmtiles` + Node | 2.4s | < 40 MB | 14 layers decoded across 4 zooms |

---

## 5. Operational Runbook: How to Change or Refresh the Region

To switch to a different target region (or refresh existing OSM data):

1. **Update `config/region.json`:**
   Modify `name`, `slug`, `countryCode`, `bbox`, `center`, and zoom levels.
2. **Stop Core Background Containers:**
   Free physical RAM on the 8 GB machine:
   ```powershell
   pnpm dev:stack:down
   ```
3. **Run the Automated Data Pipeline:**
   ```powershell
   pnpm region:build
   ```
   This will:
   - Validate the new configuration (`pnpm region:validate`)
   - Query Geofabrik index and download the matching extract with MD5 verification
   - Clip with context buffer to `data/region/<slug>.osm.pbf`
   - Compile vector tiles to `data/tiles/<slug>.pmtiles`
4. **Start Tile Server & Verify:**
   ```powershell
   pnpm dev:stack:tiles
   pnpm region:verify
   ```
5. **Inspect in Map Preview:**
   Open `tools/map-preview/index.html` in a web browser to verify light and dark rendering.
