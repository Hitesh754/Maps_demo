# ADR-0003: Geometry vs Geography Storage and Spatial Indexing

## Context
PostGIS offers two fundamental spatial types: `geometry` (planar, Cartesian coordinate operations) and `geography` (geodetic, spherical calculations on the WGS 84 ellipsoid). `geometry` calculations are significantly faster and support rich spatial indexing and topological operations, but Euclidean distance calculations in degrees (`ST_DWithin` on geometry) distort distances away from the equator. Conversely, `geography` computes true geodesic distances in meters natively, but operations are computationally heavier.

## Decision
We adopt a hybrid storage and indexing model:
1. All geographic points in PostgreSQL are stored as `geometry(Point, 4326)` with Longitude/Latitude coordinates.
2. A standard GiST spatial index is created on the `geometry` column for bounding-box and intersection queries (`&&`).
3. For radius searches (e.g. "find hazards within 500 meters of [lng, lat]"), queries utilize `ST_DWithin(geom::geography, ST_MakePoint(lng, lat)::geography, radius_m)`.
4. To ensure sub-millisecond execution, this radius pattern is backed by a **functional GiST index on the cast expression**:
   ```sql
   CREATE INDEX idx_geo_events_geog ON geo_events USING GIST ((geom::geography));
   ```
5. Bounding-box queries utilize the envelope operator (`geom && ST_MakeEnvelope(west, south, east, north, 4326)`), utilizing the primary `geometry` index.

## Alternatives considered
- **Pure `geography(Point, 4326)` Storage:** Rejected because vector tile generation (`ST_AsMVT`), clipping, and envelope intersections require casting back to `geometry`, causing unnecessary conversion overhead on read-heavy tile queries.
- **Pure `geometry` with Degree Approximations:** Rejected because converting meters to degrees via `radius / 111320.0` introduces significant latitude-dependent longitudinal distortion that causes incorrect radius filtering.

## Consequences
- **Positive:** Combines the raw speed and tiling compatibility of `geometry` with geodesic accuracy in meters for user radius searches. Functional index ensures zero runtime casting penalty.
- **Negative:** Dual GiST indexes consume additional disk space and slightly increase insert latency, which is acceptable given Meridian's read-dominant query profile.

## Evidence/links
- PostGIS Official Documentation: Indexing Types and Functional Indexes
- `docs/architecture/domain-model.md`

## Status
Approved
