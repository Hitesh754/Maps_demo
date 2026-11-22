# Meridian MVP Scope, Priority Tiers & Non-Goals

**Document Version:** 1.0.0  
**Status:** Approved  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

---

## 1. Executive Scope Statement

The Minimum Viable Product (MVP) of the Meridian Geospatial Intelligence Platform delivers complete, end-to-end functionality for ingesting, verifying, deduplicating, visualizing, and routing around road hazards for a **single configured metropolitan region** (e.g. Vadodara, Gujarat or Berlin, Germany).

Meridian proves that high-performance geospatial infrastructure, autonomous vector basemaps, and verifiable hazard intelligence can operate cleanly on modest developer hardware without commercial map API lock-in.

---

## 2. In-Scope vs. Out-of-Scope Matrix

| Functional Area | In-Scope (MVP Core Deliverable) | Out-of-Scope (Deferred to Post-MVP) |
| :--- | :--- | :--- |
| **Geographic Coverage** | Single configured metropolitan region (< 100 MB OSM PBF). | Multi-region, state-scale, or global worldwide routing. |
| **Basemap Infrastructure** | Self-hosted PMTiles generated via Planetiler and served via `go-pmtiles`. | Dynamic continuous worldwide planet tile synchronization. |
| **Road Hazard Ingestion** | Photo upload, EXIF extraction, WGS 84 coordinates, severity rating. | Continuous automated vehicle CAN-bus accelerometer streaming. |
| **Verification & Signals** | Independent signals: AI detection, authenticity, geo-validation, community, mod. | Third-party municipal government ERP API bidirectional sync. |
| **Spatial Aggregation** | Uber H3 Resolution 5–9 hexagonal rollups and heatmaps. | Complex Voronoi diagram generation or polygonal isochrones. |
| **Routing & Navigation** | Turn-by-turn routing via Valhalla with factual hazard annotations. | Real-time live traffic congestion, speed camera feeds, voice TTS. |
| **Geocoding & Search** | Self-hosted Nominatim (port 8083) with Photon / mock fallback. | Global multi-lingual address fuzzy matching. |
| **Real-Time Updates** | WebSocket hub broadcasting to subscribed H3 Res-5 cells. | Native push notification services (APNs / FCM server push). |
| **Client Platforms** | Next.js Web App (MapLibre GL JS) & Expo Mobile App (MapLibre RN Dev Build). | Apple CarPlay, Android Auto, smartwatch companions. |
| **Infrastructure** | Docker Compose on developer workstation (bounded to 4 GB RAM). | Kubernetes, Helm charts, distributed cloud multi-region clusters. |

---

## 3. Explicit Architectural Non-Goals

To prevent scope creep and maintain development discipline, the following capabilities are explicitly classified as **NON-GOALS** for the MVP:

1. **NO Live Traffic Congestion Modeling:**
   - Meridian does not ingest live traffic probe data. Travel times and ETAs are strictly free-flow speed calculations based on OpenStreetMap legal highway classifications.
2. **NO "Safer Route" Marketing Claims:**
   - Meridian annotates routes factually (e.g. *"Contains 2 verified potholes"*). It never deceptively markets an alternate route as "safer" or "hazard-free" simply because fewer reports exist.
3. **NO Global Map Coverage:**
   - The platform strictly targets a single configured bounding box extract. Expanding to statewide or worldwide extracts on 8 GB RAM machines is impossible and out of scope.
4. **NO Background Mobile Location Tracking:**
   - Mobile hazard reporting and navigation operate strictly in the **foreground**. Background continuous GPS breadcrumb logging is excluded for battery and privacy compliance.
5. **NO Voice Audio Synthesis Engine:**
   - Turn-by-turn maneuvers display visual UI arrows and emit subtle chime/audio cues; full natural language text-to-speech (TTS) voice synthesis is deferred.
6. **NO Kubernetes / Cloud Clustering:**
   - Deployment is strictly containerized Docker Compose. No multi-node orchestration, etcd, or service mesh.
7. **NO Distributed Multi-Instance Rate Limiting:**
   - Rate limiting and caching operate strictly in-process within the single Go binary. Distributed Redis caching is excluded.

---

## 4. Phase Priority Tiers (Prompts 00 – 34)

Prompts are organized into two priority tiers: **Core MVP** (mandatory for functional release) and **Extended MVP** (advanced telemetry and mobile release packaging):

| Prompt | Phase Title | Priority Tier | Rationale |
| :---: | :--- | :---: | :--- |
| **00** | Workspace Reconnaissance & Compatibility Matrix | **Core** | Completed; baseline verification. |
| **01** | Architecture, ADRs, Domain Model, Conventions | **Core** | Completed; architectural blueprint. |
| **02** | Local Infrastructure & Docker Compose | **Core** | Foundational data containers. |
| **03** | Basemap Generation Pipeline (Planetiler/PMTiles) | **Core** | Autonomous vector map display. |
| **04** | Web & Mobile Baseline Setup with MapLibre | **Core** | Presentation layer baseline. |
| **05** | Raw Observation Ingestion & Data Model | **Core** | Citizen reporting pipeline. |
| **06** | Spatial Indexing & H3 Aggregation (Go) | **Core** | Core spatial query engine. |
| **07** | Valhalla Routing Service Integration | **Core** | Navigation routing engine. |
| **08** | Geocoding Adapter (Nominatim / Photon) | **Core** | Address lookup and search. |
| **09** | NATS JetStream Event Pipeline & Outbox | **Core** | Resilient asynchronous event fabric. |
| **10** | Dynamic Map Styling & Vector Tile Rendering | **Core** | Cartographic styling and visual polish. |
| **11** | Spatial Search & Bounding Box Queries | **Core** | High-performance API search. |
| **12** | Observation Deduplication & Canonical Events | **Core** | Event clustering and spam prevention. |
| **13** | Verification State Machine & Signal Fusion | **Core** | Independent evidence state machine. |
| **14** | ML Inference Adapter (Pothole & Authenticity) | **Core** | AI hazard classification. |
| **15** | Geofencing Engine & Location Triggers | **Core** | Spatial watch areas and alerts. |
| **16** | Road-Network Hazard Intelligence & Speed | **Core** | Hazard corridor impact analysis. |
| **17** | Developer-Facing Spatial REST APIs & OpenAPI | **Core** | Third-party developer integration. |
| **18** | Web Map Exploration & Layer Controls | **Core** | Desktop analyst GIS workspace. |
| **19** | Mobile Hazard Reporting Flow (Camera/GPS) | **Core** | Primary citizen submission UI. |
| **20** | Offline Mobile Caching & Local Vector Tiles | **Core** | Mobile offline resilience. |
| **21** | Turn-by-Turn Navigation with Hazard Audio Alerts | **Core** | Active driver hazard navigation. |
| **22** | Moderation Dashboard & Web Confirmation UI | **Core** | Municipal oversight interface. |
| **23** | Analytics Aggregation Pipeline (Hex Heatmaps)| **Core** | Citywide infrastructure analytics. |
| **24** | Real-Time Live Event Streaming (WebSockets) | **Core** | Live map event synchronization. |
| **25** | Authentication, RBAC & API Key Management | **Core** | Production security and access control. |
| **26** | Automated Data Expiry & Archival Worker | **Core** | Database maintenance and retention. |
| **27** | Synthetic Data & Seed Extraction Generator | **Core** | Local demonstration seed data. |
| **28** | Observability, Tracing & slog JSON Logging | **Extended** | Deep distributed telemetry profiling. |
| **29** | End-to-End Integration Tests (Testcontainers) | **Extended** | Automated multi-container test suites. |
| **30** | Performance Benchmarking & Load Testing | **Extended** | High-throughput stress verification. |
| **31** | Mobile Build & EAS Profile Configuration | **Extended** | Cloud mobile packaging and release. |
| **32** | Hardening, Security Audit & Anonymization | **Core** | Final privacy and vulnerability gates. |
| **33** | Documentation, OpenAPI Specs & Runbooks | **Core** | Comprehensive platform documentation. |
| **34** | Final Release Verification & Packaging | **Core** | End-to-end operational sign-off. |
