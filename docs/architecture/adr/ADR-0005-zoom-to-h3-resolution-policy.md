# ADR-0005: Zoom-to-H3 Resolution Mapping Policy

## Context
When web and mobile clients query hexagonal aggregates and heatmaps across different map zoom levels (from whole-city zoom 10 to street-level zoom 18), requesting an inappropriate H3 resolution results in either severe visual clutter (millions of microscopic hexagons) or uninformative massive blocks. The mapping from client map zoom level to H3 cell resolution must be deterministic and standardized across all clients.

## Decision
We establish a standardized, versioned zoom-to-H3 resolution mapping table embedded in the Go contract and client libraries:

| Web / Mobile Zoom Level Range | Target H3 Resolution | Average Hexagon Edge Length | Visual Purpose |
| :---: | :---: | :---: | :--- |
| **Zoom 0 – 9** | Resolution 5 | ~8.5 km | Regional / metropolitan density overview |
| **Zoom 10 – 11** | Resolution 6 | ~3.2 km | District / sub-city cluster view |
| **Zoom 12 – 13** | Resolution 7 | ~1.2 km | Neighborhood / ward aggregation |
| **Zoom 14 – 15** | Resolution 8 | ~461 m | Sector / arterial corridor analysis |
| **Zoom 16+** | Resolution 9 | ~174 m | Street / block-level canonical resolution |

1. At Zoom 16+, clients transition from aggregated H3 hexagonal overlays to discrete point vector features.
2. The mapping is maintained as an immutable code constant in `packages/contracts` and `internal/spatial/h3.go`.

## Alternatives considered
- **Client-Determined Resolution:** Rejected because malicious or malfunctioning clients could request Resolution 10 over a nationwide bounding box, triggering database denial of service.
- **Continuous Resolution Splitting:** Rejected due to caching complexity; discrete stepped intervals allow high HTTP ETag cache hit rates.

## Consequences
- **Positive:** Uniform visual density across Web and Mobile, optimal query performance, predictable payload sizes.
- **Negative:** Stepped transitions between zoom levels 11/12 and 13/14 require frontend smooth opacity cross-fading.

## Evidence/links
- `docs/architecture/api-conventions.md`
- Uber H3 Resolution Table

## Status
Approved
