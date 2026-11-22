# ADR-0002: Go as Sole Business Logic Backend

## Context
Next.js provides full-stack capabilities including App Router Route Handlers and Server Actions. In mixed full-stack repositories, developers frequently duplicate business logic across Node.js/Next.js API routes and backend services, leading to fragmented database access patterns, mismatched validation rules, and conflicting authentication models.

## Decision
Go is designated as the **sole authority and runtime for all business logic, data persistence, and spatial operations**.
1. Next.js App Router route handlers (`apps/web/src/app/api/*`) are strictly prohibited from executing business logic, querying the database directly, or acting as a secondary backend.
2. Next.js functions purely as a presentation layer, querying the Go REST API (`/v1/*`) and WebSocket gateway over standard HTTP/WS.
3. All domain models, spatial calculations (H3, PostGIS), authorization checks, and transaction management reside exclusively within Go packages under `internal/`.

## Alternatives considered
- **Next.js Backend-for-Frontend (BFF) with Prisma/Drizzle:** Rejected because Node.js lacks native high-performance geospatial engines equivalent to PostGIS/pgx, duplicate H3 bindings would be required, and database connections would be fragmented across two runtimes.
- **Direct Next.js API Routes for Web, Go for Mobile:** Rejected as an anti-pattern creating two divergent implementations of the platform's API contracts.

## Consequences
- **Positive:** Single source of truth for business logic, deterministic data validation, maximum execution performance, clear separation between UI state and core geospatial intelligence.
- **Negative:** Web frontend engineers must use standard HTTP client patterns and cannot use Next.js Server Actions for direct database mutations.

## Evidence/links
- Project Constants Section A ("Go owns all business logic. No Next.js API routes as business backend.")
- `docs/architecture/module-boundaries.md`

## Status
Approved
