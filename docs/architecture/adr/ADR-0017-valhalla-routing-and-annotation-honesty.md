# ADR-0017: Valhalla Routing Engine Integration and Route Annotation Honesty

## Context
Navigation is a core application of the Meridian platform. While commercial routing engines incorporate real-time live traffic feeds and proprietary historical speed models, Meridian operates on OpenStreetMap highway graphs using an open-source engine. Falsely claiming to beat commercial navigators or deceptively labelling a route as "safer" based solely on sparse user-submitted pothole reports is unethical and technically unsound.

## Decision
1. **Routing Engine:**
   - We deploy **Valhalla** (`ghcr.io/gis-ops/docker-valhalla/valhalla:latest`) running in Docker Compose on port `8002`.
   - Routing tiles are pre-compiled from the target region's `.osm.pbf` file.
   - Valhalla provides high-performance multi-modal routing (auto, bicycle, pedestrian), dynamic cost matrices, and maneuver instructions.
2. **Route Annotation Honesty Principles:**
   - **Free-Flow Speed Only:** ETAs and travel times are calculated based strictly on OpenStreetMap legal speed limits and highway classifications. Meridian **never claims live traffic awareness** in the MVP.
   - **Annotated, Never "Safer":** When routing through areas with verified road hazards, routes are presented with factual hazard annotations (e.g. *"Route contains 3 verified potholes along Main Street"*).
   - **Prohibition of "Safest Route" Claims:** The platform is explicitly prohibited from labelling an alternate route as "safer" or "hazard-free" simply because fewer reports exist. Incomplete reporting in low-traffic areas must never be conflated with physical road safety.

## Alternatives considered
- **OSRM (Open Source Routing Machine):** OSRM is fast but its memory requirements for hierarchical contraction hierarchies are higher, and dynamic cost updates/avoidance areas require full graph rebuilds. Valhalla's tiled graph architecture allows dynamic edge penalization.
- **pgRouting in PostGIS:** Rejected due to high query latency and lack of turn-by-turn guidance generation.

## Consequences
- **Positive:** Honest, transparent routing; resilient turn-by-turn calculations; seamless local Docker deployment.
- **Negative:** Free-flow travel times will diverge from real-world congested traffic during peak hours.

## Evidence/links
- Project Constants Section A ("Do not claim to beat Google Maps; ETA is free-flow only; routes are annotated, never labelled 'safer'")
- Valhalla Routing Engine Documentation: `https://valhalla.github.io/valhalla/`

## Status
Approved
