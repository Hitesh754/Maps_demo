# ADR-0007: OpenAPI-First Contract Workflow and Code Generation Tooling

## Context
Code-first API development frequently leads to drift between backend implementation, frontend client types, and public API documentation. Meridian requires an OpenAPI-first contract model where TypeScript clients and Go routing interfaces are automatically generated from a single canonical specification.

## Decision
1. We enforce an **OpenAPI-First** workflow. The canonical API specification is authored under `api/openapi/openapi.yaml` adhering strictly to **OpenAPI 3.0.3**.
2. **Go Backend Codegen:** We use `github.com/oapi-codegen/oapi-codegen/v2` (v2.9.0, MIT, verified in Prompt 00) with the `chi-server` and `types` generation targets.
   - `oapi-codegen` generates strict chi route definitions, request body decoders, and parameter binders.
   - Handlers implement the generated `ServerInterface`.
3. **TypeScript Client Codegen:** We use `openapi-typescript` (v7.13.0, MIT, verified in Prompt 00) in `packages/contracts` to generate strongly-typed TypeScript definitions for Web (`apps/web`) and Mobile (`apps/mobile`).
4. Specification versioning follows Semantic Versioning under the `/v1` path prefix.

## Alternatives considered
- **OpenAPI 3.1.0:** Evaluated in Prompt 00. While `openapi-typescript` supports 3.1, Go tooling (`oapi-codegen/v2`) exhibits partial/experimental support for 3.1 polymorphic schemas. OpenAPI 3.0.3 was selected for 100% stability across Go and TypeScript toolchains.
- **ogen Generator (`github.com/ogen-go/ogen`):** Evaluated in Prompt 00. Rejected because `ogen` mandates its own HTTP server runtime rather than integrating cleanly with chi.

## Consequences
- **Positive:** Zero client-server contract drift, compile-time type safety across Go and TypeScript, automated generation of interactive Swagger/Redoc documentation.
- **Negative:** Modifying an API endpoint requires updating the YAML contract and executing codegen before implementing handler logic.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (`oapi-codegen/v2` v2.9.0 and `openapi-typescript` v7.13.0)
- OpenAPI Specification 3.0.3

## Status
Approved
