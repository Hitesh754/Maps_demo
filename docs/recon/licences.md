# Licence and Attribution Register

**Date of Verification:** 2026-11-22  
**Platform Codename:** Meridian  
**Investigator:** Principal Software Architect and Release Engineer  

---

## 1. Overview & Compliance Objectives

This document establishes the intellectual property, copyright, and licence compliance register for the Meridian platform. All third-party libraries, container images, geographic datasets, and machine learning components are cataloged with their exact legal requirements.

---

## 2. Geospatial Data & Mapping Licences

### 2.1. OpenStreetMap (OSM)
- **Licence:** Open Database License (ODbL) 1.0 ([ODbL Summary](https://opendatacommons.org/licenses/odbl/1-0/)).
- **Attribution Obligation:**
  - Mandatory text: `"© OpenStreetMap contributors"`
  - Hyperlink target: `https://www.openstreetmap.org/copyright`
- **Copyleft / Share-Alike Scope:**
  - **Derivative Database:** If Meridian creates an altered database containing OSM data (e.g., custom road graph enhancements, merged road geometry), that derivative database must be released under the ODbL if publicly distributed.
  - **Produced Work:** Visual map tiles (`.pmtiles`), rendered map views on web/mobile, and calculated routing turn-by-turn steps are legally classified as "Produced Works" under Section 4.3 of the ODbL. A Produced Work does **not** trigger copyleft for the entire application, backend business logic, or private user observations.
- **Where Attribution Must Appear:**
  - Visible in the bottom-right corner of every interactive map view (Web and Mobile) at all times.
  - In the application "About" screen, documentation, and the root `NOTICE` file.

### 2.2. Geofabrik Extracts
- **Licence:** Open Database License (ODbL) 1.0 (derived from OpenStreetMap).
- **Attribution Obligation:** OpenStreetMap attribution as above. Customary citation: `"Extracts provided by Geofabrik"`.
- **Where Attribution Must Appear:** `docs/`, `NOTICE`, and platform data provenance documentation.

### 2.3. OpenMapTiles Schema & Planetiler Profile
- **Licence:**
  - OpenMapTiles Schema: Creative Commons Attribution 4.0 International (CC-BY 4.0).
  - Planetiler Software: Apache License 2.0.
- **Attribution Obligation:**
  - Mandatory text: `"© OpenMapTiles"`
  - Combined basemap attribution: `"© OpenStreetMap contributors © OpenMapTiles"`.
- **Where Attribution Must Appear:** Map canvas attribution widget, documentation, and `NOTICE` file.

### 2.4. Map Glyphs (Fonts) & Sprites
- **Fonts (Noto Sans, Roboto, Open Sans):** SIL Open Font License 1.1 (OFL-1.1) / Apache-2.0.
  - Requirement: The OFL copyright notices must be retained in the font asset bundle and credited in the software distribution notice.
- **Sprites (OpenMapTiles osm-bright / Positron):** CC-BY 4.0 / BSD-3-Clause.
  - Requirement: Attribution in `NOTICE` file.

---

## 3. Geospatial Service Engines

### 3.1. Valhalla Routing Engine
- **Licence:** MIT License (Kevin Kreiser / Mapzen / Valhalla team).
- **Commercial Implications:** Permissive; commercial use, modification, and private deployment allowed.
- **Where Attribution Must Appear:** Retain copyright notice in backend service source and `NOTICE` file.

### 3.2. Nominatim Geocoding Engine
- **Licence:** GNU General Public License v3.0 or later (GPL-3.0-or-later).
- **Copyleft Boundary:**
  - Nominatim runs as a self-contained microservice container in Docker Compose.
  - The Meridian Go backend communicates with Nominatim strictly over HTTP REST (`GET /search`).
  - Under copyright law and FSF guidelines, communication across a standard network API boundary constitutes "mere aggregation", preventing GPL-3.0 from infecting the Go backend or mobile application code.
- **Public Nominatim Usage Policy Warning:**
  - The public OSM Nominatim API (`nominatim.openstreetmap.org`) has an **extremely strict acceptable use policy** (maximum 1 request per second, bulk geocoding strictly forbidden, mobile client direct calls forbidden).
  - Meridian **must never** point end-user traffic to the public Nominatim instance. Self-hosted Nominatim or a local fallback (Photon) is legally and operationally mandatory.

### 3.3. PostGIS Extension
- **Licence:** GNU General Public License v2.0 or later (GPL-2.0-or-later).
- **Copyleft Boundary:** Runs as an internal extension inside PostgreSQL. Go client queries execute via the PostgreSQL TCP wire protocol (`pgx`). Application code is entirely unaffected by PostGIS copyleft.

---

## 4. Platform Infrastructure & Libraries

| Component | SPDX Licence | Copyleft Implications | Commercial Use | Mandatory Action |
| :--- | :--- | :--- | :--- | :--- |
| **Uber H3 (`h3-go/v4`)** | Apache-2.0 | None (Permissive) | Permitted | Include Apache-2.0 notice in `NOTICE` |
| **NATS Server & nats.go** | Apache-2.0 | None (Permissive) | Permitted | Include Apache-2.0 notice in `NOTICE` |
| **MinIO** | AGPL-3.0-or-later | Strong Copyleft over network if modified | Restricted | **Avoid modifications.** Use standard AWS SDK v2 client. For local dev, SeaweedFS (Apache-2.0) eliminates AGPL exposure entirely. |
| **go-pmtiles** | BSD-3-Clause | None (Permissive) | Permitted | Include copyright notice in `NOTICE` |
| **MapLibre GL JS** | BSD-3-Clause | None (Permissive) | Permitted | Include BSD-3-Clause notice in Web build |
| **MapLibre React Native**| MIT | None (Permissive) | Permitted | Include MIT notice in Mobile build |
| **Next.js & React** | MIT | None (Permissive) | Permitted | Standard web bundle notices |
| **Expo & React Native** | MIT | None (Permissive) | Permitted | Standard app bundle notices |
| **Go (`chi`, `pgx`, `goose`, `sqlc`)**| MIT | None (Permissive) | Permitted | Standard Go binary notices |

---

## 5. Machine Learning Repository Licence Audit

**Target Repository:** `https://github.com/Hitesh754/Pothole-Vision-main`  
**Inspected Branches:** `machine-learning` and `pothole-verify` (Primary source inspection via GitHub raw content and tree inspection; no code cloned).

### Primary Source Findings:
1. **Branch `machine-learning`:**
   - Files present: `.gitignore`, `Dockerfile`, `README.md`, `api/`, `architecture_doc.md`, `config.yaml`, `dataset/`, `requirements.txt`, `setup.py`, `src/`, `tests/`.
   - **LICENSE File:** **NONE FOUND** (HTTP 404 on `LICENSE`, `LICENSE.md`, `LICENSE.txt`).
2. **Branch `pothole-verify`:**
   - Files present: `.gitignore`, `README.md`, `app.py`, `checks.py`, `db.py`, `generate_sample_images.py`, `requirements.txt`, `sample_images/`, `scoring.py`, `test_pothole_verify.py`, `uploads/`.
   - **LICENSE File:** **NONE FOUND** (HTTP 404 on `LICENSE`, `LICENSE.md`, `LICENSE.txt`).

### Legal Impact & Compliance Finding:
- **Status:** **BLOCKER / HIGH RISK**.
- Under standard international copyright law (Berne Convention), when a repository contains no open-source license, all rights are reserved by the author. No third party holds legal authorization to copy, run, containerize, or build services upon this code without an explicit written license grant.
- **Action Required:**
  - Before deploying or wrapping the ML services in Meridian inference adapters, the copyright owner (`Hitesh754` / repository owner) must commit a standard open-source license (recommended: MIT or Apache-2.0) to both `machine-learning` and `pothole-verify` branches.
  - In Prompt 00 and early backend development, Meridian will interact with ML inference strictly through an abstraction interface with an explicit stub adapter (`INFERENCE_ADAPTER=stub` with `is_stub=true`), avoiding direct execution or dependency on unlicenced code until formal resolution.
