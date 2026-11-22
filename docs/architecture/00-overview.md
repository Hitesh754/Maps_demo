# Meridian Architecture: System Overview

**Document Version:** 1.0.0  
**Status:** Approved  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

---

## 1. Executive Summary & System Mission

Meridian is a self-hosted, cloud-independent Geospatial Intelligence Platform delivering high-performance spatial infrastructure, dynamic road-hazard intelligence, and verified geographic observations for a configured metropolitan region.

While consumer mapping applications focus exclusively on consumer point-to-point navigation, Meridian treats navigation as merely **one client application** of a broader geospatial engine. The platform provides:
1. **Interactive Vector Basemaps:** Autonomous, offline-capable PMTiles vector tile pipeline generated via Planetiler and served via `go-pmtiles` without reliance on third-party commercial tile services.
2. **Spatial Search & Geocoding:** Sub-millisecond geographic queries via PostgreSQL/PostGIS, accompanied by an isolated Nominatim/Photon geocoding adapter.
3. **Hierarchical Hexagonal Aggregation:** Multi-resolution spatial binning and heatmap statistics computed in Go using Uber H3 (`h3-go/v4`), stored as 64-bit integer indexes (`BIGINT`).
4. **Asynchronous Real-Time Event Fabric:** A transactional outbox event pipeline backed by NATS JetStream, routing deduplicated road events and spatial notifications to WebSocket consumers subscribing to localized H3 cells.
5. **Multi-Signal Hazard Intelligence:** AI-assisted pothole and road-surface damage detection, cryptographically authenticated media validation, community verification, and moderator oversight. Crucially, **signals are never averaged into a single opaque score**; each signal is preserved independently, with canonical verification states computed via deterministic, versioned state machines.

---

## 2. High-Level System Context (C4 Level 1)

The following diagram illustrates Meridian's boundaries, user personas, client interfaces, and external platform touchpoints:

```mermaid
flowchart TD
    subgraph Users ["Actors & External Clients"]
        CitizenDriver["Citizen / Mobile Driver"]
        WebAnalyst["City Analyst / Moderator"]
        ThirdPartyDev["Third-Party Developer"]
    end

    subgraph MeridianPlatform ["Meridian Geospatial Platform"]
        WebClient["Meridian Web Application\n(Next.js App Router)"]
        MobileClient["Meridian Mobile App\n(Expo + React Native)"]
        APIGateway["Meridian Core API & Worker Monolith\n(Go / chi / pgx / h3-go)"]
        VectorTileServer["go-pmtiles Vector Server"]
        EventBroker["NATS JetStream Message Broker"]
        SpatialDB[("PostgreSQL 17 + PostGIS 3.5\n(Primary Store)")]
        ObjectStore[("S3-Compatible Object Storage\n(SeaweedFS / MinIO)")]
    end

    subgraph ExternalServices ["External & Subsystem Dependencies"]
        ValhallaService["Valhalla Routing Engine\n(OSM Graph)"]
        NominatimService["Nominatim / Photon Geocoder"]
        InferenceServices["ML Inference Microservices\n(Pothole Vision / Verification)"]
    end

    CitizenDriver -->|Report Hazards, View Map| MobileClient
    WebAnalyst -->|Moderate Events, View Analytics| WebClient
    ThirdPartyDev -->|Spatial REST APIs & WebSockets| APIGateway

    WebClient -->|HTTPS REST & WS| APIGateway
    WebClient -->|Fetch Vector Tiles Z/X/Y| VectorTileServer
    MobileClient -->|HTTPS REST & WS| APIGateway
    MobileClient -->|Fetch Vector Tiles Z/X/Y| VectorTileServer

    APIGateway -->|Read / Write SQL & Geo| SpatialDB
    APIGateway -->|Publish Outbox / Consume Events| EventBroker
    APIGateway -->|Presign & Store Media| ObjectStore
    APIGateway -->|Routing Queries| ValhallaService
    APIGateway -->|Geocoding Queries| NominatimService
    APIGateway -->|Asynchronous Inference Tasks| InferenceServices
```

---

## 3. Container Architecture (C4 Level 2)

Meridian is architected as a **modular monolith** with decoupled asynchronous worker daemons, avoiding microservice sprawl while maintaining clean internal boundaries:

```mermaid
flowchart LR
    subgraph Ingress ["Edge & Network Layer"]
        ReverseProxy["Docker Compose Reverse Proxy / Gateway"]
    end

    subgraph Applications ["Frontend Applications"]
        WebApp["Web App (Port 3000)\nNext.js App Router, MapLibre GL JS"]
        MobileApp["Mobile App (Dev Build)\nExpo SDK 57, MapLibre React Native"]
    end

    subgraph BackendCore ["Backend Monolith (Go Module)"]
        APIServer["cmd/api (Port 8080)\nREST API, Auth, Outbox Publisher,\nWebSocket Hub"]
        WorkerEvents["cmd/worker-events\nDeduplication, Signal Fusion,\nVerification Engine"]
        WorkerAnalytics["cmd/worker-analytics\nH3 Res 5-9 Rollups,\nHeatmap Aggregator"]
        WorkerMedia["cmd/worker-media\nEXIF Stripping, Anonymization,\nThumbnail Generation"]
    end

    subgraph Infrastructure ["Data & Messaging Tier"]
        DB[("PostgreSQL 17 + PostGIS 3.5\n(Port 5432)")]
        NATS["NATS JetStream (Port 4222)\nStreams: OBSERVATIONS, GEO_EVENTS,\nNOTIFICATIONS"]
        Storage[("Object Storage S3 (Port 9000)\nSeaweedFS / MinIO")]
        TileServer["go-pmtiles (Port 8082)\nServing planetiler.pmtiles"]
        Valhalla["Valhalla Engine (Port 8002)\nOSM Routing Tiles"]
        Nominatim["Nominatim (Port 8083)\nOSM Address Index"]
    end

    Applications -->|HTTP / WS| ReverseProxy
    ReverseProxy -->|Port 8080| APIServer
    ReverseProxy -->|Port 8082| TileServer

    APIServer -->|pgxpool| DB
    APIServer -->|Client| NATS
    APIServer -->|aws-sdk-go-v2| Storage
    APIServer -->|HTTP REST| Valhalla
    APIServer -->|HTTP REST| Nominatim

    WorkerEvents -->|pgxpool| DB
    WorkerEvents -->|JetStream Consumer| NATS

    WorkerAnalytics -->|pgxpool| DB
    WorkerAnalytics -->|JetStream Consumer| NATS

    WorkerMedia -->|S3 Get/Put| Storage
    WorkerMedia -->|JetStream Consumer| NATS
```

---

## 4. End-to-End Observation Ingestion Pipeline

The report ingestion flow implements an asynchronous, resilient transactional outbox architecture:

```mermaid
sequenceDiagram
    autonumber
    actor Mobile as Mobile Client
    participant API as cmd/api (Go)
    participant DB as PostgreSQL (PostGIS)
    participant S3 as Object Storage
    participant NATS as NATS JetStream
    participant Relay as Outbox Publisher
    participant Worker as cmd/worker-events
    participant ML as ML Inference Adapter

    Mobile->>API: 1. POST /v1/reports/presign (filename, size, hash)
    API-->>Mobile: Presigned PUT URL & Media ID
    Mobile->>S3: 2. Direct PUT Image (Raw Photo)
    Mobile->>API: 3. POST /v1/reports (observation payload, media_id, lat/lng)
    
    rect rgb(240, 248, 255)
        Note over API,DB: Single ACID Database Transaction
        API->>DB: INSERT into observations (raw submission)
        API->>DB: INSERT into outbox (topic='observation.created', payload)
    end
    
    API-->>Mobile: 202 Accepted (observation_id, status='pending')

    loop Transactional Outbox Relay
        Relay->>DB: SELECT pending outbox rows FOR UPDATE SKIP LOCKED
        Relay->>NATS: Publish to stream OBSERVATIONS (Nats-Msg-Id=outbox_id)
        Relay->>DB: UPDATE outbox SET published_at=NOW()
    end

    NATS->>Worker: Consume 'observation.created' (AckPolicy.Explicit)
    
    par Spatial Deduplication & Event Assignment
        Worker->>DB: Query existing geo_events (ST_DWithin within R meters and window T)
        alt Existing geo_event found
            Worker->>DB: INSERT into event_confirmations (links observation to geo_event)
        else No match found
            Worker->>DB: INSERT into geo_events (new canonical event, state='submitted')
        end
    and Asynchronous AI Inference
        Worker->>ML: POST /predict (Media reference)
        ML-->>Worker: Inference Result (pothole_detected=true, confidence=0.88)
        Worker->>DB: INSERT into event_signals (type='ai_detection', data)
    end

    Worker->>DB: Evaluate Verification Policy State Machine
    Worker->>DB: UPDATE geo_events SET verification_state='active'
    Worker->>DB: INSERT into outbox (topic='geo_event.updated')
    Worker-->>NATS: Ack Message
```

---

## 5. Independent Signals Model

In consumer platforms, evidence from machine learning, image metadata, and user votes is often condensed into an opaque, single numerical trust score (e.g. `confidence: 72%`). Meridian explicitly rejects this model.

### 5.1. Core Principles
1. **Independent Provenance:** Every piece of evidence is persisted as an independent row in the `event_signals` table with its own creator, timestamp, schema-validated payload, and cryptographic signature where applicable.
2. **No Averaged Scores:** Signals are never blended into a single floating-point number.
3. **Decoupled Authenticity vs Truth:**
   - Image authenticity analysis verifies whether an image is an unmodified capture from a camera hardware sensor (as opposed to a downloaded meme, AI generation, or screenshot).
   - **Authenticity never proves location or capture time.** A genuine photo of a pothole taken in New York can be falsely submitted as an observation in Vadodara.
4. **Geo-Validation as an Independent Claim:**
   - Geo-validation algorithms compare device-reported GPS coordinates against EXIF GPS tags, cell-tower metadata, and road-network distance. This comparison generates a `geo_validation` signal, which is recorded as an independent claim.
5. **Deterministic Policy Derivation:**
   - The canonical `verification_state` (`unverified`, `community_confirmed`, `moderator_confirmed`, `disputed`, `rejected`) is derived deterministically by a versioned policy engine evaluated whenever new signals arrive.

```mermaid
graph TD
    RawObs["Raw Observation Submission"] --> S1["Signal 1: ai_detection\n(Pothole classifier confidence: 0.91)"]
    RawObs --> S2["Signal 2: authenticity\n(Error Level Analysis / Sensor Noise: PASS)"]
    RawObs --> S3["Signal 3: geo_validation\n(EXIF coords match GPS within 4.2m)"]
    CommunityVote["Community Confirmation"] --> S4["Signal 4: community\n(3 unique trusted drivers confirmed)"]
    ModReview["Admin / City Moderator"] --> S5["Signal 5: moderator\n(Physical repair crew verified)"]

    subgraph SignalStore ["Independent Evidence Matrix (event_signals table)"]
        S1
        S2
        S3
        S4
        S5
    end

    SignalStore --> PolicyEngine{"Deterministic Policy Engine\n(Version 1.0.0)"}
    PolicyEngine --> CanonicalState["Canonical State: community_confirmed\n(Published to Public Map & APIs)"]
```

---

## 6. Frontend Cartographic & UX Design Principles

Every web and mobile UI prompt across the Meridian platform must adhere to the following binding UX principles:

1. **Original Cartographic Identity:**
   - Meridian avoids generic copycat styling of Google Maps or Apple Maps. Basemaps utilize customized, restrained vector palettes prioritizing road network geometry, structural typography, and hazard clarity.
2. **Minimal, Premium Aesthetic:**
   - Monospaced coordinates, subtle elevation layering, muted neutral landcover, and high-contrast, purpose-driven semantic indicators for road hazards.
3. **First-Class Dark and Light Modes:**
   - Full tokenized color palettes for dark mode (optimized for night driving and control rooms) and light mode (optimized for daytime outdoor mobile visibility).
4. **Tokenized Design System:**
   - Spacing, typography, border radii, and elevation levels originate strictly from `packages/design-tokens` and `packages/ui`. Hardcoded pixel values and ad-hoc Tailwind colors are prohibited.
5. **Map Readability First:**
   - UI chrome, bottom sheets, and search panels float above the map canvas with translucent blurred backgrounds, ensuring the spatial context of the viewport is never fully obscured.
6. **Zero Silent States:**
   - Every data surface must provide explicitly designed states for:
     - `loading` (smooth skeleton shimmer, no erratic layout shifts)
     - `empty` (clear contextual explanation with a call to action)
     - `error` (RFC 9457 actionable error messages with retry buttons)
     - `permission-denied` (informative guidance for location or camera permissions)
7. **No Decorative Controls:**
   - Every visible button, toggle, and filter must connect to real, working application logic. No placeholder buttons or dead UI controls.
8. **Visible Attribution:**
   - OpenStreetMap ODbL and OpenMapTiles attribution must remain visible on every interactive map canvas in compliance with Section 4.3 of the ODbL license.
