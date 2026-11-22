# ADR-0016: Self-Hosted Geocoding Adapter (Nominatim with Photon Fallback)

## Context
Meridian requires forward geocoding (search query $\rightarrow$ coordinates) and reverse geocoding (coordinates $\rightarrow$ street address). The public OpenStreetMap Nominatim instance enforces a strict policy prohibiting heavy traffic, mobile client calls, and bulk queries. Self-hosting Nominatim on the developer's 8 GB machine introduces severe RAM constraints (requiring $\ge 4\text{ GB}$ RAM for imports).

## Decision
1. **Isolated Backend Adapter:**
   - All geocoding requests from clients route exclusively through the Go backend endpoint `GET /v1/search/geocode` and `GET /v1/search/reverse`.
   - Mobile and web clients are strictly prohibited from calling external geocoding endpoints directly.
   - The Go package `internal/search` interacts with geocoding engines via an interface (`Geocoder`).
2. **Primary Engine (Self-Hosted Nominatim):**
   - For environments with sufficient resources, `mediagis/nominatim:5.3` runs in Docker Compose, bound to **Port 8083** (to avoid collision with Metro bundler on port 8081).
   - City extract import is configured with constrained memory parameters: `--osm2pgsql-cache 1024` and `--threads 2`.
3. **Lightweight Fallback (Photon / Mock):**
   - For constrained development machines, an alternative adapter is supported:
     - `komoot/photon` (Apache-2.0, lightweight Java Lucene search engine built on OSM data).
     - Local SQLite-based spatial address lookup or mock geocoder for unit testing.

## Alternatives considered
- **Direct Client Calls to Public Nominatim:** Rejected as a direct violation of OpenStreetMap Foundation policies, risking IP blocks.
- **Commercial Geocoding APIs (Google Geocoding, Mapbox):** Rejected to preserve self-hosted sovereignty and zero third-party billing.

## Consequences
- **Positive:** Complete isolation from public geocoding rate limits, secure server-side request signing, unified address caching in Go backend.
- **Negative:** Initial import of Nominatim on developer machines requires substantial disk space and bounded RAM configuration.

## Evidence/links
- `docs/recon/environment.md` (Port 8081 collision resolution to 8083)
- Nominatim Usage Policy: `https://operations.osmfoundation.org/policies/nominatim/`

## Status
Approved
