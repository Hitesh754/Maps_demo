# Meridian Design Language: Cartographic Precision & Clarity

**Date:** 2026-11-23  
**Status:** Canonical  
**Author:** Principal Product Designer & Staff Frontend Engineer  

---

## 1. Design Philosophy: "Paper, Ink, and Precision"

Meridian rejects the generic, hyper-saturated aesthetics of mass-market consumer navigation applications. We do not copy Google Maps' pastel saturation or Apple Maps' high-blur consumer gloss. 

Instead, Meridian is built on an **original cartographic and engineering aesthetic**:
- **Warm Neutral Surfaces:** Base backgrounds evoke high-grade architectural paper (`#f5f4f0` in light mode) and deep obsidian slate (`#11161d` in dark mode).
- **Ink-Like Road Hierarchy:** Streets are drawn like precise drafting pens, moving from hairline service roads up to confident, burnt-amber highway arteries (`#e06c28` / `#ea580c`).
- **One Confident Primary Accent:** A sharp, authoritative cobalt/sky blue (`#0284c7` in light, `#38bdf8` in dark) reserved strictly for interactive focus, active states, and user location.
- **Quiet Restraint:** Map layers never compete with data. Landuse and water are desaturated and quiet; labels are legible with crisp contrast halos.

---

## 2. Core Visual Rules

### 2.1. Density & Spacing
- Strict 4px base modular scale (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`, `64px`).
- Desktop interfaces prioritize information density (compact tables, tabular numeric readouts, 32px standard button height in dense panels).
- Touch viewports strictly enforce a **minimum 44px x 44px hit target** for all interactive floating map controls.

### 2.2. Elevation & Surfaces
- 4 surface levels to establish clear visual depth:
  - `Level 0 (Canvas)`: The raw map viewport or page background.
  - `Level 1 (Surface)`: Floating toolbars, search bars, side panels, and cards (`rgba(255, 255, 255, 0.95)` / `rgba(17, 24, 39, 0.95)`).
  - `Level 2 (Elevated)`: Popovers, dropdown menus, segmented control pills, and active tabs.
  - `Level 3 (Overlay)`: Modals, full-screen dialogs, and high-priority toast alerts.
- **Glass & Blur Policy:** Modern browsers utilize `backdrop-filter: blur(12px)` for floating map chrome. For browsers lacking `backdrop-filter` support, solid opaque surfaces with high-contrast borders (`#e2e8f0` / `#334155`) serve as the verified fallback.

### 2.3. Radii & Geometry
- `sm (4px)`: Chips, badges, keyboard shortcuts (`<kbd>`).
- `md (8px)`: Buttons, inputs, segmented control segments.
- `lg (12px)`: Floating map control clusters, side panels, bottom sheets, dialogs.
- `full (9999px)`: Circular icon buttons (zoom, compass, geolocate), status indicator dots.

### 2.4. Typography & Numerics
- **UI Font:** Clean modern system stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Monospace Font:** JetBrains Mono / SFMono / Consolas for coordinates, zoom levels, bounding boxes, H3 hex indexes, and telemetry readouts.
- **Tabular Figures (`tnum`):** All coordinates, speeds, timestamps, and zoom readouts enforce tabular lining figures to eliminate layout jitter during map panning.

### 2.5. Iconography
- Single icon family: **Lucide Icons** (stroke width `1.75px` or `2.0px`), maintaining identical visual weight across all controls.
- **Rule:** No emojis as UI icons. Every icon button must have a programmatic `aria-label`.

### 2.6. Motion Principles
- Fast, purposeful easing curves:
  - `fast (150ms)`: Button hover, focus ring transitions, toggle switches.
  - `normal (250ms)`: Panel opening/closing, bottom sheet expansion, toast entrance.
  - `slow (400ms)`: Camera fit-bounds animation.
- **Accessibility (`prefers-reduced-motion`):** When reduced motion is requested, all layout transitions collapse to instantaneous opacity fades (`50ms`) or zero duration.

---

## 3. Accessible Color-Vision Deficiency (CVD) System

Future observation events (potholes, road hazards, closures, speed limits) use an **accessible 6-category color scale** verified under deuteranopia, protanopia, and tritanopia simulations:

| Category Key | Meaning / Event Type | Hex (Light) | Hex (Dark) | CVD Differentiation Strategy |
|---|---|---|---|---|
| `cat1_pothole` | Pothole / Surface Defect | `#dc2626` (Red-Crimson) | `#f87171` | High luminance; distinct from amber |
| `cat2_hazard` | Debris / Object Hazard | `#d97706` (Deep Amber) | `#fbbf24` | Distinct warmth from orange/yellow |
| `cat3_construction`| Roadworks / Construction | `#ea580c` (Safety Orange) | `#fb923c` | High saturation orange |
| `cat4_restriction` | Speed / Lane Restriction | `#7c3aed` (Violet / Purple)| `#a78bfa` | Blue-free purple; visible to red-green color blind |
| `cat5_incident` | Traffic Incident / Stoppage| `#0284c7` (Sky Blue) | `#38bdf8` | High contrast against earth tones |
| `cat6_inspection` | Patrol / Verified Condition| `#059669` (Emerald Green) | `#34d399` | Bluish-green emerald (distinguishable from amber) |

*All category colors are paired with distinct geometric shape markers in map iconography so color is never the single source of information.*
