# Meridian API Conventions & HTTP Contract Standards

**Document Version:** 1.0.0  
**Status:** Approved  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

---

## 1. RESTful Resource Design & Path Conventions

1. **Path Prefix:** All API endpoints reside under the immutable major version prefix: `/v1/`.
2. **Resource Naming:** Paths utilize lowercase, hyphen-separated plural nouns representing domain resources:
   - `/v1/observations`
   - `/v1/events`
   - `/v1/event-types`
   - `/v1/layers/tiles/{z}/{x}/{y}.mvt`
   - `/v1/analytics/h3-stats`
   - `/v1/routing/directions`
   - `/v1/search/geocode`
3. **HTTP Methods:** Strictly adhere to RFC 9110 semantics:
   - `GET`: Safe, idempotent read operations.
   - `POST`: Create non-idempotent resources or initiate asynchronous commands.
   - `PUT`: Complete idempotent replacement of a resource.
   - `PATCH`: Partial modification of an existing resource.
   - `DELETE`: Idempotent resource removal or revocation.

---

## 2. Standard Query Parameters & Enforced Limits

### 2.1. Geographic Query Parameters

| Parameter | Type / Format | Example | Description |
| :--- | :--- | :--- | :--- |
| `lat` | Float `[-90, 90]` | `22.3072` | Latitude in WGS 84 degrees |
| `lng` | Float `[-180, 180]` | `73.1812` | Longitude in WGS 84 degrees |
| `radius_m` | Float `[1, 50000]` | `1500.0` | Search radius in meters |
| `bbox` | Float `west,south,east,north` | `73.15,22.28,73.22,22.34` | Bounding box envelope (minX, minY, maxX, maxY) |
| `polygon` | GeoJSON Polygon Geometry | `{"type":"Polygon",...}` | Custom area boundary (POST query or URL encoded) |
| `h3_res` | Integer `[5, 9]` | `8` | Target H3 resolution |
| `cells` | Comma-separated H3 Hex Strings | `8928308280fffff,...` | Explicit H3 cell filter (max 100 cells) |
| `types` | Comma-separated Strings | `pothole,flooding` | Filter by event type categories |
| `status` | Comma-separated Strings | `active,confirmed` | Filter by event lifecycle status |
| `since` | RFC 3339 UTC Timestamp | `2026-11-20T00:00:00Z` | Filter items updated after timestamp |
| `until` | RFC 3339 UTC Timestamp | `2026-11-22T00:00:00Z` | Filter items updated before timestamp |

### 2.2. Enforced Architectural Limits (Named Configuration)

To protect backend resources and prevent memory exhaustion on the developer machine, requests exceeding the following limits are rejected with `400 Bad Request` or `413 Payload Too Large`:

```go
const (
    MaxBboxAreaKm2       = 2500.0   // Max allowable bounding box area (50km x 50km)
    MaxSearchRadiusMeters = 50000.0  // Max allowable search radius (50 km)
    MaxPageSize           = 100      // Max records returned per page
    DefaultPageSize       = 20       // Default records per page
    MaxPolygonVertices    = 1000     // Max vertices in a custom spatial filter
    MaxPayloadBytes       = 10485760 // Max request body size (10 MB)
    MaxWebSocketCells     = 12       // Max H3 Res-5 cells subscribed per WS socket
)
```

---

## 3. Keyset Pagination Envelope

Paginated endpoints return a standard JSON envelope:
```json
{
  "data": [
    {
      "id": "0193567a-bc12-7000-8000-000000000001",
      "event_type": "pothole",
      "coordinates": [73.1812, 22.3072],
      "severity": 3,
      "status": "active",
      "created_at": "2026-11-22T14:30:00Z"
    }
  ],
  "pagination": {
    "next_cursor": "ZXlKaGJHY2lPaUpTVXp...",
    "has_more": true,
    "limit": 20
  }
}
```

---

## 4. RFC 9457 Problem Details & Error Code Catalog

All error responses return `Content-Type: application/problem+json`:

```json
{
  "type": "https://meridian.io/errors/invalid-parameters",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more request parameters failed validation.",
  "instance": "/v1/events?bbox=73,22,70,25",
  "code": "INVALID_BOUNDING_BOX",
  "invalid_params": [
    {
      "name": "bbox",
      "reason": "West coordinate (73) cannot exceed east coordinate (70)."
    }
  ]
}
```

### Complete Error Code Catalog:

| Error Code | HTTP Status | Description | Client Retry Allowed? |
| :--- | :---: | :--- | :---: |
| `VALIDATION_FAILED` | 400 | Request body failed JSON schema validation | No |
| `INVALID_COORDINATES` | 400 | Latitude/Longitude out of valid WGS 84 range | No |
| `INVALID_BOUNDING_BOX`| 400 | Bounding box coordinates inverted or malformed | No |
| `BBOX_TOO_LARGE` | 400 | Bounding box exceeds `MaxBboxAreaKm2` (2500 km²) | No |
| `AUTHENTICATION_REQUIRED` | 401 | Missing, malformed, or expired Bearer token | Yes (After refresh) |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password during login | No |
| `PERMISSION_DENIED` | 403 | User role lacks authorization for resource | No |
| `RESOURCE_NOT_FOUND` | 404 | Target ID does not exist | No |
| `CONFLICT` | 409 | Resource state conflict (e.g. duplicate email) | No |
| `IDEMPOTENCY_CONFLICT`| 409 | `Idempotency-Key` reused with different payload | No |
| `PAYLOAD_TOO_LARGE` | 413 | Request body exceeds `MaxPayloadBytes` (10 MB) | No |
| `RATE_LIMIT_EXCEEDED`| 429 | Exceeded IP or API key request quota | Yes (Honor Retry-After) |
| `INFERENCE_UNAVAILABLE`| 503 | External ML inference service timed out | Yes (Automatic retry) |
| `ROUTING_UNAVAILABLE` | 503 | Valhalla routing engine offline or unready | Yes (With backoff) |
| `GEOCODER_UNAVAILABLE`| 503 | Nominatim/Photon geocoder offline | Yes (With backoff) |
| `INTERNAL_ERROR` | 500 | Unhandled server exception | Yes (Exponential backoff)|

---

## 5. Headers, Idempotency & Caching

### 5.1. Authentication Headers
- **User JWT:** `Authorization: Bearer <jwt_token>`
- **Developer API Key:** `X-API-Key: mrd_live_<32_random_bytes>`

### 5.2. Idempotency Key (`Idempotency-Key`)
- Supported on all mutating `POST` endpoints (`/v1/reports`, `/v1/events/*/confirmations`).
- Client supplies a unique UUIDv4/UUIDv7: `Idempotency-Key: 7b34da6a-3ce9-49d0-e0e4-73600f067aa0`.
- The server caches the response for 24 hours. Re-submitting the exact same request returns the cached response with header `Idempotent-Replay: true`. Re-submitting the same key with a different body returns `409 Conflict` (`IDEMPOTENCY_CONFLICT`).

### 5.3. Rate Limit Headers
All API responses include standard IETF rate-limiting headers:
```http
RateLimit-Limit: 60
RateLimit-Remaining: 58
RateLimit-Reset: 12
```
When exceeded (`429 Too Many Requests`), the server emits:
```http
Retry-After: 12
```

### 5.4. HTTP Caching & ETags
- Analytical queries and vector tiles return strong ETags: `ETag: "w/3a8f1b92"`.
- Clients send `If-None-Match: "w/3a8f1b92"`.
- If unchanged, server immediately returns `304 Not Modified` with zero body.

---

## 6. WebSocket Protocol & Message Envelopes

### Connection: `GET /v1/realtime`
Authenticated via `?token=<access_jwt>` or `Authorization: Bearer` header.

### 6.1. Client-to-Server Control Frame:
```json
{
  "action": "subscribe",
  "cells": ["85283473fffffff", "85283477fffffff"]
}
```

### 6.2. Server-to-Client Event Broadcast Frame:
```json
{
  "event": "geo_event.updated",
  "cell": "85283473fffffff",
  "data": {
    "id": "0193567a-bc12-7000-8000-000000000301",
    "event_type": "pothole",
    "coordinates": [73.1812, 22.3072],
    "verification_state": "community_confirmed",
    "severity": 4,
    "last_observed_at": "2026-11-22T14:45:00Z"
  }
}
```
