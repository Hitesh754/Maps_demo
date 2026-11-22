# Prompt 13U Report: UI-First Design System, Web Shell, and Live Map Canvas

**Date:** 2026-11-23  
**Status:** Completed  
**Branch:** `main`  
**Region Target:** Vadodara, Gujarat, India (`vadodara`)  

---

## 1. Executive Summary

Prompt 13U establishes Meridian's frontend foundation: an original, cartographic design language ("Paper, Ink, and Precision"), an accessible component system (`@meridian/ui`), a typed Layer Registry, and a full-screen sovereign vector map explorer in `apps/web`.

In accordance with Meridian design principles:
- **No Mock Controls:** No fake search engines, routing wizards, or incident reporting forms were mounted before their backend engines exist.
- **Sovereign Network Operation:** All vector tiles (`http://127.0.0.1:8082`) and font glyphs (`http://127.0.0.1:8083`) are hosted locally via Docker. Zero third-party requests are made to commercial mapping providers.
- **Accessibility & Contrast:** Every interactive component is built with Radix UI and verified against WCAG 2.1 AA contrast standards (>= 4.5:1 text-on-surface), including a color-vision-deficiency (CVD) safe categorical color scale.

---

## 2. Deliverables & Architecture Implemented

### 2.1. Design Language & Tokens
- **Documented Design Language:** `docs/design/design-language.md` defines our cartographic aesthetic:
  - Surface elevations (`level0` through `level3`)
  - 4px baseline rhythm
  - CVD-safe category scales (Paul Tol's Bright / Okabe-Ito inspired)
  - Dark mode with midnight ink tones
- **Token Extension (`@meridian/design-tokens`):**
  - Added 4 elevation surfaces for light and dark palettes
  - Added 6 CVD-safe category color tokens (`cat1_pothole` to `cat6_inspection`)
  - Added elevation shadow scales (`shadowLevel0` to `shadowLevel3`)
  - Added responsive breakpoints (`mobile`, `tablet`, `desktop`, `wide`)
  - Added Tailwind preset (`src/tailwind-preset.ts`) and CSS custom properties (`src/tokens.css`)
  - Unit tests compute luminance and contrast ratios, asserting >= 4.5:1 WCAG AA compliance and pairwise Euclidean RGB distance >= 40.

### 2.2. Accessible Component Library (`@meridian/ui`)
Created `@meridian/ui` as a workspace package using unstyled Radix UI primitives and Lucide icons:
- `Button` (5 variants, 3 sizes, loading spinner, disabled state)
- `IconButton` (strictly requires `aria-label`, tooltip integration)
- `Surface` & `Panel` (elevation levels 0-3)
- `FloatingBar` (backdrop-blur map control container)
- `SidePanel` (collapsible desktop sidebar, keyboard operable)
- `BottomSheet` (collapsible mobile drawer with touch handle)
- `SegmentedControl` (accessible radiogroup)
- `Switch` (accessible toggle with label & description)
- `Tabs` (accessible tab list, trigger, content)
- `Tooltip` (accessible tooltips via Radix)
- `Skeleton` & `Spinner` (`role="status"`, visually hidden label)
- `EmptyState` & `ErrorState` (alert semantics, retry button)
- `InlineNotice` (info, warning, danger, success)
- `Dialog` (modal with focus trapping and accessible close)
- `Kbd` (keyboard indicator badge)
- `Badge` (status and CVD category badges)
- `SearchBox` (presentational input with `/` shortcut and injectable provider interface)
- `VisuallyHidden` (screen-reader clip utility)

### 2.3. Typed Layer Registry (`apps/web/src/lib/layers/registry.ts`)
- Configured 6 real basemap layer groups matching `@meridian/map-style`:
  - `roads`: Highway, primary, secondary, and minor streets
  - `buildings`: 2D building contours
  - `water`: Waterways, lakes, reservoirs
  - `greenery`: Parks, cemeteries, woodland
  - `labels`: Place and street names
  - `admin`: Administrative boundaries
- Provides runtime `applyVisibility(map, layerId, visible)` method to toggle vector tile rendering dynamically.

### 2.4. Sovereign Map Core (`MapView.tsx`)
- Client-only MapLibre GL JS integration with strict-mode resilient cleanup.
- Dynamic style generation with light/dark theme switching while preserving viewport coordinates.
- **Request Allowlist Guard (`transformRequest`):** Inspects all outgoing requests. Disallows any origin outside localhost/127.0.0.1 on ports 8080, 8082, 8083, returning an empty blob and logging a diagnostic warning.
- **URL Camera Synchronization:** Debounced sync to `#map={zoom}/{lat}/{lng}/{bearing}/{pitch}`.
- **Geolocation State Machine:** Handles `idle`, `prompting`, `locating`, `located`, `denied`, `unavailable`, `timeout`, and `error` with accuracy marker and accessible feedback.
- **Out-of-Region Banner:** Alerts users when panning outside Vadodara bounding box (`[73.11, 22.24, 73.28, 22.37]`) with one-click return.
- **Error Handling:** WebGL-disabled fallback screen and tile server connection retry banner.

### 2.5. Web Shell & Living Design Page
- **Web Shell (`/`):** Full-screen map canvas, floating region indicator (`Vadodara, India | z12.0`), desktop `SidePanel` / mobile `BottomSheet` with 4 real tabs:
  - **Map:** Regional metadata, live Lat/Lng/Zoom, Share View button.
  - **Layers:** Toggles connected to Layer Registry controlling vector tiles.
  - **Status:** Live readiness probes against API (`8080/readyz`), Tile server (`8082`), and Map assets (`8083`) with round-trip latency.
  - **About:** Provenance, licensing (ODbL, CC-BY 4.0, SIL OFL, BSD), privacy statement.
- **Living Design Page (`/design`):** Visual catalog of all design tokens, surfaces, buttons, notices, badges, dialogs, and states in both light and dark themes.

### 2.6. Architecture Decision Records & Security
- **ADR-0026:** Choice of Radix UI primitives over React Aria and Base UI (`docs/architecture/adr/ADR-0026-headless-ui-primitives.md`).
- **ADR-0027:** Content Security Policy and Sovereign Network Egress (`docs/architecture/adr/ADR-0027-content-security-policy.md`).
- **CSP Headers:** Configured in `apps/web/next.config.ts`.
- **Extension Points:** Documented in `docs/design/extension-points.md`.
- **Performance Notes:** Documented in `docs/design/perf-notes.md`.

---

## 3. Verification & Quality Gates

| Verification Gate | Command | Result |
| :--- | :--- | :--- |
| **Design Tokens Vitest** | `pnpm --filter @meridian/design-tokens test` | **4/4 passed** (Contrast >= 4.5:1, color distance >= 40) |
| **UI Components Vitest** | `pnpm --filter @meridian/ui test` | **11/11 passed** |
| **Map Style Spec Tests** | `pnpm --filter @meridian/map-style test` | **6/6 passed** |
| **Web Unit & A11y Tests** | `pnpm --filter web test` | **22/22 passed** (Region, camera, security, layers, a11y) |
| **TypeScript Compilation**| `pnpm typecheck` | **8/8 successful** |
| **Next.js Production Build**| `pnpm --filter web build` | **Prerendered `/`, `/design`, `/_not-found`** |
| **Monorepo Quality Gates** | `pnpm verify` | **All JS/TS, Go Vet, Go Unit Tests, Go Build passed** |
| **Local Vector Tiles** | `pnpm region:verify` | **14 layers decoded at z0, z6, z10, z14** |

---

## 4. Next Steps
With the design system, web shell, sovereign MapView, and layer registry fully operational, the system is primed for **Prompt 04 (Spatial Database Schema, Goose Migrations, and H3 Generation)** or subsequent spatial backend prompts.
