# ADR-0024: Extension Seam for Future Moving-Object Tracking

## Context
The current MVP scope focuses on static and semi-static road hazards (potholes, surface cracks, flooding, road closures). However, future iterations of Meridian may incorporate dynamic moving entities, such as snowplows, road maintenance repair trucks, or transit fleet vehicles. Designing without considering this future extension risks premature architectural rework, while attempting to build fleet tracking now violates MVP scoping.

## Decision
We define an **architectural extension seam** for moving-object tracking without implementing any live tracking features in the MVP:

1. **Domain Abstraction:**
   - The domain model explicitly distinguishes between `geo_events` (point-in-time or enduring geographic occurrences at fixed locations) and future `entity_tracks` (time-series trajectory points associated with an entity ID).
2. **Subject Naming Seam:**
   - NATS JetStream subject hierarchy reserves the `meridian.tracks.*` namespace:
     - `meridian.events.*`: Static hazard events and observations (MVP).
     - `meridian.tracks.<entity_type>.<entity_id>`: Reserved for future high-frequency GPS telemetry streams.
3. **Database Separation:**
   - High-frequency moving entity telemetry must never be written to the ACID `geo_events` table. Future tracking will utilize a specialized time-series store (TimescaleDB or partitioned append-only tables) or ephemeral in-memory state.
4. **Scope Discipline:**
   - In accordance with MVP boundaries, **no code, tables, or endpoints for moving-object tracking are implemented in MVP prompts**. Only the naming seam and structural boundaries are reserved.

## Alternatives considered
- **Overloading `geo_events` with Moving Vehicle Updates:** Rejected because high-frequency GPS updates (1–5 Hz) would flood the transactional outbox, trigger continuous event deduplication checks, and bloat the hazard database.
- **Building Full Fleet Tracking into MVP:** Rejected as out-of-scope feature creep that would delay core geospatial intelligence milestones.

## Consequences
- **Positive:** Clear architectural boundary, future-proofed messaging taxonomy, strict protection of MVP focus.
- **Negative:** None; zero code is written for this seam in the current release.

## Evidence/links
- `docs/architecture/mvp-scope.md`
- `docs/architecture/event-catalog.md`

## Status
Approved
