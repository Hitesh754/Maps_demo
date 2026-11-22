# Geospatial Data Attribution & Compliance Policy

**Platform:** Meridian Geospatial Intelligence Platform  
**Compliance Standard:** OpenStreetMap ODbL 1.0 & OpenMapTiles CC-BY 4.0  

---

## 1. Legal Attribution Mandate

Project Meridian uses OpenStreetMap (OSM) data compiled into vector tiles via the OpenMapTiles schema and Planetiler. Both licenses require clear, prominent attribution.

### Exact Text and HTML Formats

- **HTML Format (Web Maps):**
  ```html
  <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a> | <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">&copy; OpenMapTiles</a>
  ```
- **Plain-Text Format (Mobile / CLI):**
  ```
  © OpenStreetMap contributors | © OpenMapTiles
  ```

---

## 2. Where Attribution Must Appear

1. **Web Map Interface (`apps/web`):**
   - The map attribution control must be visibly rendered in the bottom-right corner of every interactive map viewport.
   - It must never be hidden, obscured, or made smaller than readable legibility thresholds (minimum 10px font size).
2. **Mobile Map Interface (`apps/mobile`):**
   - On mobile screens, attribution must appear in the lower corner of the MapLibre Native canvas or directly accessible within the app's settings/legal screen.
3. **API Responses (`backend/`):**
   - Developer spatial APIs returning OSM-derived geometry or geocoding data must include an `attribution` metadata key in payload envelopes.
4. **Repository Documentation & Source Control:**
   - The top-level `NOTICE` file maintains full third-party copyright statements, license links, and data vintage records.
