# Meridian Architectural & Domain Glossary

**Document Version:** 1.0.0  
**Status:** Approved  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

---

## Terminology Directory (Alphabetical)

### `api_key`
A secure, hashed developer credential used to authenticate programmatic access to Meridian's spatial REST APIs. Stored exclusively as a SHA-256 hash; the plaintext `mrd_live_...` key is displayed only once upon generation.

### `authenticity (signal)`
An independent verification signal evaluating whether an uploaded image conforms to raw camera hardware sensor encoding and compression characteristics, as opposed to an AI-generated, screenshot, or digitally manipulated file. **Authenticity never proves capture location or capture time.**

### `dead_letter_queue (DLQ)`
A dedicated NATS JetStream stream (`MERIDIAN_DLQ`) that captures messages exceeding maximum delivery retry attempts (`MaxDeliver: 5`), holding them alongside error diagnostics for administrative inspection and requeue.

### `deduplication_rule`
The spatial and temporal clustering algorithm that determines whether a newly ingested `observation` represents an existing active hazard or a novel incident. Configured per `event_type` using clustering radius $R$ (meters) and time window $T$ (minutes).

### `derivative_database`
Under Section 4.4 of the Open Database License (ODbL 1.0), a database created by extracting, altering, or translating OpenStreetMap data. If publicly distributed, the derivative database must be released under the ODbL. Meridian avoids creating a public derivative database by storing user observations in independent tables.

### `event_confirmation`
A database record linking an incoming `observation` or user vote to an existing canonical `geo_event`, representing physical corroboration of a hazard.

### `event_history`
An append-only, tamper-evident audit table recording every state transition, status change, severity modification, and actor associated with a `geo_event`.

### `event_signal`
A discrete, independent row of evidence attached to a `geo_event`. Signal types include `ai_detection`, `authenticity`, `geo_validation`, `community`, and `moderator`. Signals are **never averaged into a single score**; each retains independent provenance.

### `event_type`
A configurable domain category defining a class of road infrastructure condition (e.g. `pothole`, `surface_crack`, `flooding`, `debris`), its default time-to-live (TTL), deduplication radius $R$, time window $T$, and attribute JSON schema.

### `expo_development_build`
A specialized native Android or iOS application binary compiled with `expo-dev-client` that bundles custom native code and third-party C++/Java libraries (specifically `@maplibre/maplibre-react-native`). **Required for Meridian mobile execution; standard Expo Go is unsupported.**

### `free_flow_speed`
Travel speed and estimated time of arrival (ETA) calculated strictly from OpenStreetMap legal speed limits and highway classifications. Meridian navigates using free-flow speed and **never claims real-time live traffic awareness** in the MVP.

### `geo_event`
The canonical, deduplicated geographic entity aggregated from one or more raw observations. Represents the ground-truth road hazard displayed on map surfaces and exposed to routing algorithms.

### `geo_validation (signal)`
An independent verification signal produced by comparing camera EXIF metadata (embedded coordinates and timestamps) against client-reported device GPS telemetry and OpenStreetMap road network proximity. **Geo-validation is an assessment of consistency, not absolute truth.**

### `go-pmtiles`
A high-performance Go web server that reads static `.pmtiles` single-file archives and serves standard vector map tiles (`.mvt`) via HTTP using HTTP Byte-Range requests.

### `h3_cell_stats`
A pre-aggregated analytical table maintained by background workers storing hazard counts, average severities, and observation totals binned across H3 Resolutions 5 through 9 in hourly time buckets.

### `h3_index`
A 64-bit integer (`BIGINT`) representing an Uber H3 hexagonal spatial cell. Individual events store canonical Resolution 9 (`h3_r9`); real-time WebSocket subscriptions filter on Resolution 5 (`h3_r5`).

### `idempotent_consumer`
A message consumer pattern that records incoming message identifiers (`Nats-Msg-Id`) in a `processed_messages` database table, guaranteeing that duplicate deliveries do not trigger duplicate processing.

### `observation`
The raw, immutable report submitted by a citizen, driver, or sensor device containing GPS coordinates, severity rating, media asset reference, and device telemetry. Appended to the database and never altered.

### `odbl`
The Open Database License 1.0 governing OpenStreetMap data, requiring visible attribution and enforcing share-alike rules on publicly distributed derivative databases.

### `planetiler`
An open-source Java tool that rapidly compiles raw OpenStreetMap `.osm.pbf` extracts into a single, compact `planetiler.pmtiles` vector tile archive using the OpenMapTiles schema.

### `pmtiles`
An open, single-file archive format for tiled vector and raster data designed by Protomaps. Allows cloud-native serving of entire map regions using HTTP range requests without requiring a traditional tile database.

### `produced_work`
Under Section 4.3 of the ODbL 1.0, a rendered map graphic, vector tile response, or turn-by-turn routing calculation derived from OpenStreetMap data. Creating and serving a Produced Work **does not trigger copyleft** on the underlying application source code or user observations.

### `route_annotation`
A transparent routing principle where routes traversing hazard areas display factual annotations (e.g. *"Contains 3 verified potholes"*). The platform is **strictly prohibited from marketing a route as 'safer'** simply because fewer user reports exist in the database.

### `synthetic_benchmark`
Artificially generated road hazard records used exclusively for stress and performance load testing. Bounded strictly to an isolated database schema (`benchmark`), tagged with `source = 'synthetic_benchmark'`, and **strictly prohibited from ever appearing on public map UIs**.

### `transactional_outbox`
A database reliability pattern where domain entity mutations and outbound event messages are committed to PostgreSQL within the **exact same ACID transaction**. An asynchronous relay daemon polls the outbox and publishes messages to NATS JetStream, eliminating dual-write data loss.

### `valhalla`
An open-source C++ routing and turn-by-turn navigation engine running in Docker Compose that calculates routes, multi-point matrices, and maneuvers over tiled OpenStreetMap routing graphs.

### `verification_state`
The canonical, derived assessment of a `geo_event`'s legitimacy. Allowed states are:
- `unverified`: Initial submission awaiting corroborating evidence.
- `community_confirmed`: Corroborated by independent citizen reports meeting policy thresholds.
- `moderator_confirmed`: Validated by official municipal or administrative authority.
- `disputed`: Community reports road is clear or reports contradictory evidence.
- `rejected`: Flagged as fraudulent, synthetic, or invalid.
