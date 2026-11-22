# ADR-0023: Synthetic Benchmark Data Isolation (Separate Schema and Source Tagging)

## Context
Validating spatial query performance, H3 aggregation throughput, and vector tile rendering requires generating hundreds of thousands of synthetic observations and hazard events. If synthetic benchmark data is inserted directly into production or active development tables, it pollutes search results, distorts user maps, and risks leaking fake road damage into public citizen apps.

## Decision
1. **Strict Data Isolation:**
   - Synthetic benchmark datasets live strictly in a dedicated database schema: `benchmark` (e.g. `benchmark.geo_events`, `benchmark.observations`).
   - If benchmark tables mirror primary tables, every synthetic row must include mandatory metadata:
     ```sql
     source = 'synthetic_benchmark'
     is_synthetic = true
     ```
2. **Production / Map UI Prohibition:**
   - All public and internal map endpoints (`/v1/events`, `/v1/layers/*`, `/v1/analytics/*`, `/v1/realtime`) enforce an unbypassable SQL predicate filter:
     ```sql
     WHERE source != 'synthetic_benchmark' AND is_synthetic = false
     ```
   - Synthetic benchmark data **is strictly never served to any web or mobile map interface**.
3. **Lifecycle Management:**
   - Benchmark generator scripts (`scripts/benchmark/seed.go`) provide one-command teardown (`TRUNCATE TABLE benchmark.geo_events`) to reclaim storage.

## Alternatives considered
- **Testing on Live Production/Development Tables with Cleanup:** Rejected because crashes during load testing leave orphaned fake data that pollutes the user experience.
- **Separate Docker Compose Database Container:** Rejected to avoid running multiple PostgreSQL instances on the memory-constrained 8 GB developer machine. A separate PostgreSQL schema inside the single instance provides 100% isolation with zero additional memory overhead.

## Consequences
- **Positive:** Safe, repeatable stress testing up to $10^6$ events without compromising live or development datasets.
- **Negative:** Benchmark generator scripts must explicitly target the `benchmark` schema and maintain schema parity with `public`.

## Evidence/links
- Project Constants Section A ("Synthetic benchmark data lives in a separate schema/database tagged source='synthetic_benchmark' and is never served to any map UI.")
- `docs/architecture/performance-budgets.md`

## Status
Approved
