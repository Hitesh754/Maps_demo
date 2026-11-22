# Meridian Developer Guide

## Monorepo Architecture

Meridian uses a **pnpm workspaces + Turborepo** monorepo layout:

```
├── apps/
│   ├── web/               # Next.js 16 (App Router) + Tailwind CSS + MapLibre GL JS
│   └── mobile/            # Expo SDK 57 + React Native 0.86 + Expo Router
├── packages/
│   ├── contracts/         # Zod schemas, TypeScript types for API payloads & RFC 9457
│   ├── api-client/        # Strongly-typed fetch client for Web and Mobile
│   ├── design-tokens/     # Semantic cartographic color scales, typography, and spacing
│   └── ui/                # Shared cross-platform UI components (Prompt 13)
├── backend/               # Go backend modular monolith
│   ├── cmd/api/           # REST API entrypoint (chi router, health, slog JSON)
│   ├── internal/platform/ # Config, database pool, health checks, storage, events
│   └── migrations/        # Goose SQL migrations for PostGIS
├── infra/
│   └── compose/           # Docker Compose infrastructure definitions
├── api/
│   └── openapi/           # OpenAPI 3.0 specifications
└── scripts/               # Automation, smoke test, and verification scripts
```

---

## Monorepo Commands

| Command | Action |
| :--- | :--- |
| `pnpm install` | Install all dependencies across all apps and packages |
| `pnpm dev:stack` | Start local Docker Compose cluster (PostGIS, NATS, MinIO, API) |
| `pnpm dev:stack:down` | Stop local Docker Compose cluster |
| `pnpm dev:stack:reset` | Destructively wipe containers and volumes (`--force` required) |
| `pnpm db:migrate` | Execute pending database migrations |
| `pnpm lint` | Run ESLint across monorepo |
| `pnpm typecheck` | Run `tsc --noEmit` across all apps and packages |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:integration` | Run Go integration tests against the live Compose cluster |
| `pnpm build` | Compile packages and build Next.js application |
| `pnpm verify` | Canonical quality gate: executes lint, typecheck, test, and build |

---

## How to Add a New Shared Package

1. Create a directory under `packages/<package-name>`.
2. Add a `package.json` with the scope `@meridian/<package-name>` and `"private": true`.
3. Add a `tsconfig.json` extending `../../tsconfig.base.json`.
4. Implement TypeScript source code in `src/index.ts`.
5. In consuming apps (e.g. `apps/web/package.json`), add `"@meridian/<package-name>": "workspace:*"`.
6. Run `pnpm install` at the workspace root to wire workspace links.

---

## Backend Guidelines

1. **Go owns all business logic:** No business logic or database queries inside Next.js API routes.
2. **PostGIS spatial accuracy:** All geographic coordinates use SRID 4326 in GeoJSON `[longitude, latitude]` order.
3. **RFC 9457 Error Conventions:** All non-2xx responses must return `application/problem+json` with standard fields (`type`, `title`, `status`, `detail`, `code`, `instance`).
4. **No Secrets in Code:** Configuration is strictly injected via environment variables validated at startup in `internal/platform/config`.
