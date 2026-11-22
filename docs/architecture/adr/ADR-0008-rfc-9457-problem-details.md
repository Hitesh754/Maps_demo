# ADR-0008: RFC 9457 Problem Details Error Model

## Context
Custom error payload formats (e.g. `{ "error": "something went wrong", "code": 123 }`) vary widely across microservices, lack machine-readable error taxonomies, and fail to provide actionable debugging context. Modern REST architectures require a standardized, RFC-compliant error reporting schema.

## Decision
All Meridian HTTP error responses (4xx and 5xx) strictly adhere to **RFC 9457: Problem Details for HTTP APIs** with the `Content-Type: application/problem+json` header.

The standard error structure is defined as:
```json
{
  "type": "https://meridian.io/errors/invalid-coordinates",
  "title": "Invalid Spatial Coordinates",
  "status": 400,
  "detail": "Latitude must be between -90 and 90 degrees; provided value was 120.45.",
  "instance": "/v1/reports/obs_01h8x4k2",
  "code": "INVALID_COORDINATES",
  "invalid_params": [
    {
      "name": "lat",
      "reason": "Out of valid WGS 84 range [-90, 90]"
    }
  ]
}
```
1. `type`: A stable URI identifying the error category.
2. `title`: A short human-readable summary.
3. `status`: HTTP status code matching the response header.
4. `code`: A machine-readable, stable uppercase string from the platform error catalog.
5. `invalid_params`: Optional list of field-level validation errors.

## Alternatives considered
- **Simple JSON Error (`{ "error": string }`):** Rejected as insufficient for automated client error handling, multi-field form errors, and localization.
- **GraphQL-Style Error Arrays:** Rejected to maintain standard REST semantics and HTTP status code alignment.

## Consequences
- **Positive:** Uniform error handling across Web, Mobile, and developer APIs. Client interceptors can programmatically inspect `code` and `invalid_params`.
- **Negative:** Handlers must construct structured problem objects rather than returning raw error strings.

## Evidence/links
- IETF RFC 9457 (Problem Details for HTTP APIs, obsoleting RFC 7807)
- `docs/architecture/api-conventions.md`

## Status
Approved
