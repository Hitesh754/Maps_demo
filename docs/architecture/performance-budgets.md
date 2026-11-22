# Meridian Performance Budgets & Benchmark Hypotheses

**Document Version:** 1.0.0  
**Status:** Working Hypothesis (Pre-Benchmark)  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

> [!WARNING]
> **COMPLIANCE NOTICE:** All metrics in this document are **initial engineering hypotheses** established for architectural validation. **No budget is presented as achieved.** Every metric must be empirically tested, validated, or revised during the formal benchmark gates in **Prompt 06** (Spatial Indexing Benchmarks) and **Prompt 30** (End-to-End Performance & Load Testing).

---

## 1. Reference Hardware Baseline

All performance hypotheses are calibrated against the developer machine hardware verified in `docs/recon/environment.md`:
- **Processor:** 12th Gen Intel(R) Core(TM) i5-1235U (10 Cores: 2 Performance + 8 Efficient; 12 Logical Processors).
- **Host Memory:** 8,065,780 KB visible physical RAM (~7.69 GB), ~1.00 GB baseline free.
- **Virtualization Target:** Docker Desktop with WSL2 backend (bounded to 4.0 GB RAM in `.wslconfig`).
- **Disk:** NVMe SSD on C: (~51 GB free space).
- **Operating System:** Windows 11 Home Single Language (Build 10.0.26300, 64-bit).

---

## 2. Measurable Initial Performance Budgets (Hypotheses)

| Performance Dimension | Metric Target (Hypothesis) | Measurement Methodology | Reference Test Tool | Validation Gate |
| :--- | :--- | :--- | :--- | :---: |
| **Spatial Bbox Query (Z16+)** | $p_{50} < 10\text{ ms}$, $p_{95} < 25\text{ ms}$, $p_{99} < 50\text{ ms}$ | HTTP GET `/v1/events?bbox=...` over $10^4$ events | `k6` / Go benchmark | Prompt 06 |
| **Geodesic Radius Query** | $p_{50} < 15\text{ ms}$, $p_{95} < 35\text{ ms}$, $p_{99} < 75\text{ ms}$ | HTTP GET `/v1/events?lat=...&lng=...&radius_m=1500` | `k6` / Go benchmark | Prompt 06 |
| **Basemap Vector Tile (go-pmtiles)**| $p_{50} < 5\text{ ms}$, $p_{95} < 15\text{ ms}$, $p_{99} < 30\text{ ms}$ | HTTP GET `/v1/tiles/{z}/{x}/{y}.mvt` from `.pmtiles` | `autocannon` / `k6` | Prompt 03 |
| **Dynamic Vector Tile (ST_AsMVT)** | $p_{50} < 20\text{ ms}$, $p_{95} < 45\text{ ms}$, $p_{99} < 90\text{ ms}$ | HTTP GET `/v1/layers/events/{z}/{x}/{y}.mvt` | `k6` / Go benchmark | Prompt 06 |
| **H3 Cell Rollup Query (Z5–15)** | $p_{50} < 8\text{ ms}$, $p_{95} < 20\text{ ms}$, $p_{99} < 40\text{ ms}$ | HTTP GET `/v1/analytics/h3-stats?res=7` | `k6` / Go benchmark | Prompt 06 |
| **Valhalla Route Request** | $p_{50} < 30\text{ ms}$, $p_{95} < 80\text{ ms}$, $p_{99} < 150\text{ ms}$ | HTTP POST `/v1/routing/directions` (15 km route) | `k6` / Valhalla test | Prompt 07 |
| **Observation Ingestion (API)** | $p_{50} < 15\text{ ms}$, $p_{95} < 35\text{ ms}$, $p_{99} < 60\text{ ms}$ | HTTP POST `/v1/reports` (Returns 202 Accepted) | `k6` load suite | Prompt 05 |
| **Outbox Relay Publication Lag** | $p_{95} < 500\text{ ms}$ from DB commit to NATS | Timestamp delta (`published_at - created_at`) | OpenTelemetry metrics | Prompt 09 |
| **Worker Deduplication Throughput**| $> 250\text{ observations/sec}$ per worker instance | Continuous stream processing rate | JetStream consumer gauge| Prompt 12 |
| **WebSocket Broadcast Latency** | $p_{95} < 50\text{ ms}$ from NATS to client socket | WebSocket round-trip timestamp delta | Custom WS test client | Prompt 24 |

---

## 3. Network Payload & Client Memory Budgets

### 3.1. Network Payload Size Caps:
- **Vector Basemap Tile (`.mvt`):** Bounded to **$< 80\text{ KB}$ gzip** per tile ($< 150\text{ KB}$ max in dense city center).
- **H3 Aggregated Stats Payload:** Bounded to **$< 40\text{ KB}$ gzip** per viewport view.
- **GeoJSON Viewport Query:** Bounded to **$< 100\text{ KB}$ gzip** (enforced by `limit = 100` cap).
- **Sanitized Public WebP Photo:** Bounded to **$< 250\text{ KB}$** for detail images, **$< 35\text{ KB}$** for thumbnails.

### 3.2. Client Runtime Memory Footprint (Web & Mobile):
- **Web Client (Next.js + MapLibre GL JS):**
  - Resident memory bounded to **$< 200\text{ MB}$** on desktop Chromium.
  - Steady-state 60 fps rendering during continuous map pan/zoom.
- **Mobile Client (React Native + MapLibre RN):**
  - Resident memory bounded to **$< 150\text{ MB}$** on Android devices.
  - Zero memory leaks during 15-minute continuous driving navigation simulation.

---

## 4. Benchmark Execution & Revision Protocol

1. **Benchmark Tooling:** Load tests utilize Go's native testing framework (`testing.B`), `k6`, and `vegeta`.
2. **Empirical Verification:** During Prompt 06, automated test runs will populate an empirical results table alongside these initial hypotheses.
3. **Budget Adjustment:** If measured performance under reference hardware diverges by $> 25\%$, the budget table will be formally amended with an explanation of hardware-specific factors.
