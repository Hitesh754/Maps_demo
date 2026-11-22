# ADR-0027: Content Security Policy and Network Egress Architecture

## Context
Meridian is designed as a sovereign, self-contained geospatial intelligence platform. To protect user privacy, prevent cross-site scripting (XSS), stop data exfiltration, and ensure complete independence from third-party tile providers or trackers, the web application must enforce strict network boundaries at both the HTTP header level (Content Security Policy) and the application client level (MapLibre request transform).

The web application runs on port 3000, interacting with:
- Meridian Go API (`http://127.0.0.1:8080`)
- Meridian Vector Tile Server (`http://127.0.0.1:8082`)
- Meridian Map Assets & Glyphs Server (`http://127.0.0.1:8083`)
- Local development WebSockets (`ws://127.0.0.1:8080` and Next.js HMR)

## Decision
We enforce a **Zero-Third-Party Network Egress Policy** using defense-in-depth:

1. **HTTP Content Security Policy (CSP):**
   Configured in `apps/web/next.config.ts` across all HTTP responses:
   - `default-src 'self'`: Disallows external origins by default.
   - `script-src 'self' 'unsafe-inline' 'unsafe-eval'`: Allows Next.js App Router scripts and React runtime; in production eval is restricted.
   - `style-src 'self' 'unsafe-inline'`: Allows Tailwind CSS and MapLibre inline style injections.
   - `connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:* blob:`: Restricts all XHR, fetch, and WebSocket connections exclusively to self and local Meridian services. Third-party CDNs (Mapbox, Carto, Google, OSM public servers) are strictly blocked.
   - `img-src 'self' data: blob:`: Allows local UI icons, vector sprite sheets, and raster data URLs.
   - `font-src 'self' data:`: Allows bundled fonts and local asset fonts.
   - `worker-src 'self' blob:`: Required for MapLibre WebWorker vector tile decoding.
   - `child-src blob:`: WebWorker support.
   - `frame-ancestors 'none'`: Prevents clickjacking.
   - `object-src 'none'`: Blocks Flash/Java plugins.
   - `base-uri 'self'`: Prevents base tag hijacking.

2. **Client-Side Request Transform Guard (`transformRequest`):**
   Every network request initiated by MapLibre GL JS passes through an allow-list verification function. Requests targeting any hostname other than `127.0.0.1`, `localhost`, or relative/blob URLs are rejected immediately before touching the network stack, throwing a descriptive diagnostic warning.

## Alternatives considered
- **Permissive CSP allowing any HTTPS connection (`connect-src *`):** Rejected because it risks accidental regressions where external tile services or telemetry leaks user coordinates.
- **Client-Side Guard Only:** Rejected because malicious browser extensions or XSS injections can bypass client JS guards unless backed by browser-enforced HTTP CSP headers.

## Consequences
- **Positive:** Complete privacy assurance; coordinates and queries never leave the configured local or self-hosted deployment; robust XSS and exfiltration defense.
- **Negative:** Developers integrating new upstream data providers must explicitly configure proxy endpoints in the Meridian Go API rather than calling third-party services directly from the browser.

## Evidence/links
- W3C Content Security Policy Level 3
- RFC 9457 Problem Details for HTTP APIs
- `docs/architecture/adr/0015-self-hosted-basemap-pipeline.md`

## Status
Approved
