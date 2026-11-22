# ADR-0014: Media Privacy, EXIF Extraction, and Derivative Sanitization

## Context
When citizens submit road hazard photos from smartphones, the images contain sensitive personal data: GPS coordinates, device identifiers, and timestamp metadata embedded in EXIF headers, alongside potential visual captures of pedestrian faces and vehicle license plates. Storing and publicly serving raw camera images directly violates privacy principles (GDPR, India DPDP Act 2023) and exposes reporters to tracking.

## Decision
We enforce a strict three-tier media ingestion and privacy pipeline:

1. **Tier 1 — Private Raw Storage:**
   - Client uploads raw photos directly to an S3-compatible private bucket via short-lived presigned PUT URLs (`/v1/reports/presign`).
   - The raw storage bucket is strictly private; public read access is blocked.
2. **Tier 2 — EXIF Metadata Claim Extraction:**
   - An asynchronous media worker (`cmd/worker-media`) reads the raw image from the private bucket.
   - EXIF metadata (camera make, lens, exposure, internal GPS coordinates, capture timestamp) is parsed and saved as an **independent verification claim** in `event_signals` (`signal_type: 'geo_validation'`).
   - This claim is compared against the user's reported submission coordinates.
3. **Tier 3 — Complete Derivative Sanitization:**
   - The worker generates sanitized public derivatives: WebP visual representations with **100% of EXIF, GPS, and device metadata stripped**.
   - Image dimensions are capped (e.g. maximum $1920\times 1080$ for detail view, $400\times 300$ for thumbnails).
   - Sanitized derivatives are stored in a public/CDN-backed bucket.
   - Only sanitized derivative URLs are served to public clients and APIs.

## Alternatives considered
- **Direct Client-Side EXIF Stripping:** Rejected because relying on client-side stripping prevents the backend from validating camera authenticity and GPS claims, which are critical for anti-spoofing fraud detection.
- **Serving Raw Images with Content-Disposition Headers:** Rejected because image URLs can be scraped, exposing sensitive EXIF metadata.

## Consequences
- **Positive:** Full regulatory compliance (GDPR/DPDP), zero EXIF leakage to third parties, anti-spoofing claim extraction preserved internally.
- **Negative:** Requires background worker CPU processing for image decoding, re-encoding to WebP, and derivative thumbnail generation.

## Evidence/links
- `docs/recon/risks.md` (Risk RSK-08: Personal Data in Hazard Photos)
- `docs/architecture/privacy-and-licensing.md`

## Status
Approved
