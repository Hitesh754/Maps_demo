# ADR-0018: Dense Vector Tile Serving Strategy (ST_AsMVT vs GeoJSON Viewport Queries)

## Context
When web and mobile clients display hundreds or thousands of road hazard events across a city viewport, client performance degrades if large GeoJSON payloads must be parsed, transformed into DOM/canvas elements, and clustered on the main thread. PostGIS provides `ST_AsMVT` to encode vector tiles dynamically at the database level. However, dynamic tile generation consumes database CPU.

## Decision
We establish a phased, benchmark-driven strategy for serving dynamic road hazard layers:

1. **Low to Medium Zoom Levels (Zoom 5 – 15):**
   - Events are served as **H3 hexagonal aggregates** via structured JSON endpoints (`GET /v1/analytics/h3-stats`). This delivers pre-computed count summaries with minimal payload size (< 50 KB).
2. **Street Zoom Levels (Zoom 16+):**
   - For discrete point events at street level, Meridian supports two delivery mechanisms behind an abstraction:
     - **Mechanism A (GeoJSON Viewport Bounding Box):** `GET /v1/events?bbox=west,south,east,north` returning compact GeoJSON FeatureCollections, utilized when total event density in the viewport is $< 500$ points.
     - **Mechanism B (Dynamic Mapbox Vector Tiles via `ST_AsMVT`):** `GET /v1/layers/events/{z}/{x}/{y}.mvt` served by Go handlers wrapping optimized PostGIS `ST_AsMVT` queries with spatial clipping.
3. **Benchmarking Decision Gate:**
   - Formal benchmarks in Prompt 06 will measure database CPU, serialization latency, and client frame rate for Mechanism A vs Mechanism B across synthetic datasets ($10^3$, $10^4$, $10^5$ events).
   - If `ST_AsMVT` demonstrates $> 2\times$ throughput improvement at high density, it will be designated the primary renderer for Zoom 16+. Otherwise, bounded GeoJSON queries will be maintained for architectural simplicity.

## Alternatives considered
- **Static Pre-rendered PMTiles for Dynamic Events:** Rejected because road hazard verification states, community confirmations, and repairs change continuously in real time. Static tiling would require constant re-compilation.
- **Client-Side Heavy Clustering (Supercluster on 50,000 Points):** Rejected because mobile devices experience frame drops and memory spikes when parsing massive client-side GeoJSON blobs.

## Consequences
- **Positive:** Adaptable architecture, sub-millisecond aggregate rendering via H3, zero premature optimization before empirical benchmarking.
- **Negative:** Requires maintaining dual query routes until Prompt 06 benchmarks conclude.

## Evidence/links
- PostGIS Documentation: `ST_AsMVT` and `ST_AsMVTGeom`
- `docs/architecture/performance-budgets.md`

## Status
Approved
