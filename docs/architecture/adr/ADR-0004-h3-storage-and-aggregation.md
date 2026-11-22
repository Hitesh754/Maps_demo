# ADR-0004: Uber H3 in Go as BIGINT with Canonical Resolution 9 and Worker Rollups

## Context
Spatial aggregation over arbitrary polygonal city boundaries is computationally expensive and poorly suited for real-time heatmap caching. Uber H3 provides a discrete global hexagonal hierarchical spatial index. Storing H3 indexes as hex strings (e.g. `'8928308280fffff'`) wastes storage (16 bytes vs 8 bytes) and results in slow string comparison operations. Furthermore, computing H3 indexes at multiple resolutions upon every event insert causes write amplification.

## Decision
1. H3 indexes are computed exclusively in Go using `github.com/uber/h3-go/v4` (verified as Pure Go in Prompt 00, requiring no cgo).
2. H3 cell identifiers are stored in PostgreSQL as **64-bit unsigned integers represented as `BIGINT`** (using Go's `uint64` and Postgres's signed `int8` with two's complement bitwise casting).
3. The canonical spatial resolution for individual `geo_events` is fixed at **Resolution 9** (`h3_r9`, average hexagon edge length ~174 meters, area ~0.1 km²).
4. Coarser analytical views (Resolutions 5, 6, 7, 8) are **never computed synchronously on insert**. Instead, an asynchronous background worker (`cmd/worker-analytics`) maintains pre-aggregated count tables (`h3_cell_stats`) rolled up across hourly time buckets.
5. H3 is strictly an indexing and binning tool; **H3 is NOT a routing graph** (routing is exclusively delegated to Valhalla).

## Alternatives considered
- **H3 String Representation (`VARCHAR(15)`):** Rejected due to 100% storage overhead and lack of native 64-bit bitwise indexing.
- **Dynamic PostGIS H3 Extension (`pg-h3`):** Rejected because adding third-party C extensions to PostgreSQL increases Docker image complexity, whereas Go-native computation with `h3-go/v4` is pure Go and zero-dependency.

## Consequences
- **Positive:** Ultra-compact 8-byte storage, instant integer indexing and grouping, zero CGO overhead in Go backend containers.
- **Negative:** Frontend applications receiving 64-bit integers over JSON must handle them as strings or BigInt to avoid JavaScript IEEE-754 precision truncation.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (`github.com/uber/h3-go/v4` v4.6.0 Pure Go verification)
- Uber H3 Spatial Index Documentation: `https://h3geo.org/docs/core-library/restable`

## Status
Approved
