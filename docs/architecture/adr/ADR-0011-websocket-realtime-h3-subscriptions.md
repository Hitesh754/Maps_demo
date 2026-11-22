# ADR-0011: Real-time Communication via WebSocket with H3 Viewport Subscriptions

## Context
Citizen drivers and city dispatchers require live updates when road hazards are verified, resolved, or created nearby. Broadcasting every citywide event to all connected mobile devices consumes prohibitive cellular bandwidth, drains phone batteries, and overwhelms mobile client renderers.

## Decision
1. We establish a single, unified WebSocket endpoint at `GET /v1/realtime`.
2. Clients authenticate during WebSocket handshake via a ticket/token parameter or bearer header.
3. **H3 Viewport Subscriptions:**
   - Clients do not subscribe to individual event IDs. Instead, clients calculate the set of **H3 Resolution 5 cells** covering their current map viewport or driver route corridor.
   - Clients send a JSON control frame:
     ```json
     { "action": "subscribe", "cells": ["85283473fffffff", "85283477fffffff"] }
     ```
   - Subscriptions are strictly capped at **maximum 12 H3 Res-5 cells** per connection to prevent client-induced backend fanout exhaustion.
4. **Backend Fanout:**
   - In-process Go WebSocket hub (`internal/realtime`) subscribes to core NATS subject `meridian.events.h3.*`.
   - Incoming events are published to NATS with the canonical cell's Resolution 5 parent (`meridian.events.h3.<h3_res5_hex>`).
   - The Go WebSocket hub matches the NATS subject directly to active client subscription sets and writes frames to client sockets.

## Alternatives considered
- **Server-Sent Events (SSE):** SSE is unidirectional (server to client) and requires a secondary HTTP POST channel for client viewport updates, complicating state management. WebSockets provide low-latency full-duplex control.
- **Geographic Radius Subscriptions in Database (`ST_DWithin` on every event):** Rejected because evaluating spatial distance against thousands of concurrent mobile sockets on every new observation introduces crippling $O(N \times M)$ CPU overhead in PostgreSQL. Bounding subscriptions to discrete H3 integer cells turns spatial filtering into an instantaneous $O(1)$ hash table lookup.

## Consequences
- **Positive:** Minimal bandwidth consumption, near-zero battery impact on mobile, massive backend scalability via discrete H3 hashing, zero database load for real-time fanout.
- **Negative:** Mobile client must recalculate viewport H3 Res-5 cells during significant panning/zooming and send update control frames.

## Evidence/links
- `docs/architecture/event-catalog.md`
- `docs/architecture/api-conventions.md`

## Status
Approved
