# Meridian UI Extension Points & Future Engine Seams

This document outlines the explicit extension points designed into the Meridian Web UI Shell (`apps/web`) and `@meridian/ui` component library. In accordance with Meridian design principles, no placeholder or mock features are rendered until their underlying backend engines are operational.

---

## 1. Map Search Extension Seam

### Current State (Prompt 13U)
The UI does **not** render a fake search bar or mock address autocomplete. The `SearchBox` component in `@meridian/ui` is implemented as an accessible, presentational primitive accepting an injectable search provider interface.

### Extension Seam
- **Location:** Floating top bar in `apps/web/src/app/page.tsx`
- **Future Backend Dependency:** Nominatim geocoding adapter (`GET /api/v1/search/forward`, `GET /api/v1/search/reverse`)
- **Integration Contract:**
  ```typescript
  export interface GeocodingProvider {
    search(query: string, options?: { bbox?: [number, number, number, number] }): Promise<SearchResult[]>;
  }
  ```
- **Activation:** When the Search engine is wired, the `SearchBox` will be mounted into the floating top bar with keyboard shortcut `/` and Escape to blur.

---

## 2. Dynamic Layers Extension Seam

### Current State (Prompt 13U)
The Layer Registry (`apps/web/lib/layers/registry.ts`) manages basemap vector tile layers (Roads, Buildings, Water, Landuse, Green Areas, POIs, Administrative Boundaries).

### Extension Seam
- **Location:** Layers Tab in the primary SidePanel / BottomSheet
- **Future Backend Dependencies:**
  - `GET /api/v1/layers` (Dynamic Vector Tile layers from PostGIS via `ST_AsMVT`)
  - `GET /api/v1/layers/:id/meta` (Legend, classification ranges, attribution)
- **Integration Contract:**
  The `LayerDefinition` type supports layer types `"basemap" | "vector-mvt" | "geojson" | "raster"`. New data layers (e.g. road quality heatmap, pothole cluster density, flood risk polygons) will register dynamically with the registry without altering the tab component.

---

## 3. Real-Time Events & Incidents Extension Seam

### Current State (Prompt 13U)
Real-time observation markers and incident feeds are disabled until the WebSocket event stream and NATS JetStream event pipeline are active.

### Extension Seam
- **Location:** Dedicated Events Drawer / Floating Action Cluster
- **Future Backend Dependency:** `GET /api/v1/events/stream` (WebSocket H3 hexagon subscriptions)
- **Integration Contract:**
  When connected, incoming events will be dispatched to an in-memory spatial index and rendered as an interactive symbol layer with category color tokens (`--color-cat1` through `--color-cat6`).

---

## 4. Routing & Navigation Seam

### Current State (Prompt 13U)
No mock route directions or navigation turn-by-turn cards are rendered.

### Extension Seam
- **Location:** Slide-over Directions Panel
- **Future Backend Dependency:** Valhalla routing adapter (`POST /api/v1/routing/directions`)
- **Integration Contract:**
  Will consume GeoJSON LineString geometries and turn instructions, rendering route overview and elevation profile on top of the map canvas.
