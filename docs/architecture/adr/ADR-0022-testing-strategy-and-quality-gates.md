# ADR-0022: Test Pyramid and Quality Gates Strategy (Testcontainers-Go, Playwright, Maestro)

## Context
Complex geospatial platforms with asynchronous event processing, spatial databases, and mobile/web clients are susceptible to integration failures that unit tests mocking the database cannot catch. Conversely, relying exclusively on end-to-end tests makes CI slow and brittle. A balanced, multi-tiered testing strategy with strict merge gates is required.

## Decision
We enforce a strict four-tier testing pyramid and quality gate policy:

1. **Tier 1: Unit & Domain Logic Tests:**
   - Pure Go unit tests for spatial calculations (H3 binning, policy state machine, coordinate validation).
   - TypeScript unit tests in `packages/contracts` and `packages/ui` executed via **Vitest** (v5.1.1).
   - Fast, in-memory, zero external dependencies ($< 5\text{ seconds}$).
2. **Tier 2: Real Database & Message Broker Integration Tests:**
   - Go integration tests executed against real, ephemeral containerized dependencies using **Testcontainers-Go** (`v0.45.0`):
     - Real PostgreSQL 17 + PostGIS 3.5 container running migrations.
     - Real NATS JetStream container verifying transactional outbox relay and idempotency.
   - Mocking PostgreSQL or PostGIS SQL functions (`ST_DWithin`, `ST_AsMVT`) is strictly forbidden.
3. **Tier 3: Web End-to-End Tests:**
   - Web application flows (map panning, observation submission, moderation dashboard) tested via **Playwright** (v1.65.1) running headless Chromium.
4. **Tier 4: Mobile Flow Tests:**
   - Critical mobile reporting and navigation flows tested via **Maestro** (v2.1.1) against Android development builds.
5. **Quality Gate Rule:**
   - CI builds strictly fail if any linter (`golangci-lint`, `eslint`), typecheck (`tsc --noEmit`), or test fails.
   - Skipping or disabling tests to achieve a passing build is strictly prohibited across all prompts.

## Alternatives considered
- **In-Memory SQLite Mocking for Database Tests:** Rejected because SQLite lacks PostGIS functions, spatial indexing, and PostgreSQL transaction semantics (`FOR UPDATE SKIP LOCKED`).
- **Shared Persistent Staging Database for CI:** Rejected due to test-data contamination and lack of parallel CI isolation. Testcontainers provides completely clean, isolated environments per run.

## Consequences
- **Positive:** Absolute confidence in spatial queries and concurrency behavior; zero environment drift; reproducible local testing.
- **Negative:** Tier 2 integration tests require Docker Engine running on the test runner machine.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (Testcontainers-Go v0.45.0, Vitest v5.1.1, Playwright v1.65.1)
- `docs/architecture/testing-strategy.md`

## Status
Approved
