# ADR-0006: Identifiers, Timestamps, and Coordinate Ordering Conventions

## Context
Inconsistent identifier schemes, mixed timezone handling, and divergent coordinate order conventions (Latitude/Longitude vs Longitude/Latitude) cause chronic bugs in distributed geospatial applications. Standardizing these fundamentals at the architectural boundary is critical.

## Decision
We enforce the following platform-wide binding conventions:

1. **Identifiers (UUIDv7):**
   - All primary keys and entity IDs are **UUIDv7** (RFC 9562).
   - UUIDv7 embeds a 48-bit millisecond timestamp, providing natural time-ordered locality in B-tree database indexes, eliminating PostgreSQL table fragmentation associated with random UUIDv4.
2. **Timestamps (timestamptz UTC):**
   - All database timestamp columns are strictly `timestamptz` (timestamp with time zone).
   - All API payloads, event messages, and logs serialize timestamps in ISO 8601 / RFC 3339 format strictly in UTC (e.g. `2026-11-22T14:30:00.000Z`).
3. **Coordinate Ordering & Spatial Reference:**
   - Spatial Reference System is strictly **WGS 84 (SRID 4326)**.
   - All GeoJSON payloads adhere strictly to RFC 7946 coordinate ordering: `[longitude, latitude]` or `[longitude, latitude, elevation]`.
   - Query string parameters and function arguments are explicitly named: `lat` (latitude) and `lng` (longitude). Bounding boxes are formatted as `bbox=west,south,east,north` (minX, minY, maxX, maxY).

## Alternatives considered
- **Auto-incrementing BIGSERIAL IDs:** Rejected because sequential IDs leak business volume, prevent client-side ID pre-generation, and complicate multi-datacenter replication.
- **UUIDv4 (Random):** Rejected due to severe B-Tree index cache thrashing in PostgreSQL on tables with millions of rows.

## Consequences
- **Positive:** Optimal database index performance, seamless client-side ID generation, zero timezone conversion ambiguity, standard GeoJSON compliance.
- **Negative:** Engineers familiar with Google Maps API (`lat, lng` order) must adhere strictly to GeoJSON `[lng, lat]` standards.

## Evidence/links
- RFC 9562 (UUIDv7 Specification)
- RFC 7946 (The GeoJSON Format Specification, Section 3.1.1)

## Status
Approved
