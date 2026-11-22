# ADR-0019: In-Process Rate Limiting and In-Memory Caching Bounds (No Redis in MVP)

## Context
Distributed key-value stores (such as Redis) provide distributed rate limiting and caching across multiple servers. However, introducing Redis into the Meridian MVP increases container count, consumes additional RAM on the constrained 8 GB developer machine, and adds network latency for cache lookups. For a single-instance modular monolith, in-process memory primitives provide orders of magnitude higher throughput.

## Decision
1. **No Redis in MVP:**
   - Redis is explicitly excluded from the MVP deployment profile.
   - All rate limiting, request throttling, and short-term caching execute strictly **in-process within the Go runtime**.
2. **In-Process Token Bucket Rate Limiting:**
   - Implemented via `golang.org/x/time/rate` or token-bucket algorithms behind an internal interface (`RateLimiter`).
   - Rate limits are tracked per IP address (for unauthenticated endpoints) and per User ID / API Key (for authenticated endpoints).
   - Rate buckets are stored in a bounded in-memory thread-safe map with automatic TTL eviction to prevent memory leaks from inactive IP addresses.
3. **In-Memory LRU Caching:**
   - High-frequency read queries (e.g. H3 cell statistics, geocoding lookups) utilize bounded thread-safe in-memory Least Recently Used (LRU) caches.
   - Total cache memory is strictly bounded (e.g. maximum 50 MB RAM for spatial lookups).
4. **HTTP Caching & ETags:**
   - Static resources and vector tiles utilize strong HTTP ETags and `Cache-Control: public, max-age=...` headers, delegating caching to the browser or reverse proxy.
5. **Documented Multi-Instance Limit:**
   - We explicitly document that in-process rate limits apply on a per-instance basis. When the platform is scaled horizontally to multiple API replicas in future phases, a distributed cache adapter (Redis/KeyDB) can be introduced via the `RateLimiter` interface.

## Alternatives considered
- **Redis Container in Docker Compose:** Evaluated and rejected due to host RAM constraints (Risk RSK-02 in `docs/recon/risks.md`). In-process Go synchronization eliminates Redis container overhead.

## Consequences
- **Positive:** Zero external cache dependencies, sub-microsecond cache access latency, lower RAM footprint, trivial local setup.
- **Negative:** In-process rate limits do not synchronize across multiple independent API instances without an external broker.

## Evidence/links
- `docs/recon/environment.md` (Host memory constraints)
- `docs/architecture/performance-budgets.md`

## Status
Approved
