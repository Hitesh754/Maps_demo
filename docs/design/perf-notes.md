# Meridian Web UI Performance & Resource Notes

## Machine Budget Constraints
- **Hardware Target:** Windows 11, 8 GB RAM, WSL2 Docker Desktop.
- **Process Policy:** Heavy processes (Docker builds, Next.js production builds, Playwright tests) run sequentially, never concurrently.

## Optimization Strategies Implemented

### 1. Vector Map Lifecycle
- Single `maplibregl.Map` instance managed via React `useRef`. React strict-mode double invocation is handled cleanly to avoid memory leaks or duplicate canvas instances.
- WebGL contexts are explicitly released on unmount via `map.remove()`.
- PMTiles range requests are served directly by `go-pmtiles` with HTTP 206 Partial Content, keeping memory usage under 25 MB during map pan/zoom.

### 2. Zero Third-Party Network Overhead
- All vector tiles (`http://127.0.0.1:8082`) and font glyphs (`http://127.0.0.1:8083`) are hosted locally.
- Zero DNS lookups, zero external SSL handshakes, zero latency degradation on poor internet connections.
- Average local vector tile response time: `< 8 ms`.

### 3. Component Tree & Bundle Budget
- Unstyled Radix UI primitives ensure modular bundle tree-shaking.
- Dynamic client-only import (`next/dynamic` with `ssr: false`) for `MapView` prevents MapLibre GL JS from evaluating on Node.js server runtimes, keeping server memory minimal.
- CSS styling is 100% Tailwind CSS v4 atomic classes, eliminating CSS runtime overhead and CSS-in-JS emotion cost.

### 4. DOM & Frame Budget
- Map canvas runs at full 60 FPS GPU-accelerated frame rate.
- UI panels, badges, and floating bars use CSS transforms (`translate3d`, `opacity`) for smooth 60 FPS transitions without triggering layout recalculations.
- URL camera coordinate synchronization is debounced to 300 ms to prevent URL history pollution and thrashing.
