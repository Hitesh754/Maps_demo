# Platform Risk and Blocker Register

**Date of Assessment:** 2026-11-22  
**Platform Codename:** Meridian  
**Investigator:** Principal Software Architect and Release Engineer  

---

## Risk Summary Matrix

| Risk ID | Category | Title | Likelihood | Impact | Status | Handled In |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Licensing | ML Repository Unlicenced Status | High | Critical | **BLOCKER** | Prompt 01, 14 |
| **RSK-02** | Hardware | Host RAM Exhaustion (8 GB Total Physical) | High | Critical | **HIGH** | Prompt 02, 08 |
| **RSK-03** | Tooling | Docker & WSL2 Missing on Host | High | High | **HIGH** | Prompt 01, 02 |
| **RSK-04** | Architecture | Expo Go Incompatibility with MapLibre RN | High | High | **MITIGATED** | Prompt 01, 04 |
| **RSK-05** | Networking | Nominatim Port 8081 Collision with Metro | High | Medium | **MITIGATED** | Prompt 02, 08 |
| **RSK-06** | Geospatial | Nominatim Import Heavy Resource Cost | High | High | **MEDIUM** | Prompt 02, 08 |
| **RSK-07** | Regulatory | Administrative Boundary Depiction Laws | Medium | Critical | **HIGH** | Prompt 03, 10 |
| **RSK-08** | Privacy | Personal Data in Hazard Photos & Location | High | High | **HIGH** | Prompt 05, 12 |
| **RSK-09** | OS / Git | Windows CRLF & Line Ending Normalization | High | Low | **MITIGATED** | Prompt 01 |
| **RSK-10** | Build / CI | cgo Compilation in Container Builds | Low | Medium | **RESOLVED** | Prompt 02 |

---

## Detailed Risk Profiles

### RSK-01: ML Repository Unlicenced Status
- **Likelihood:** High (100% confirmed)
- **Impact:** Critical (Legal obstacle to distribution or derivative works)
- **Evidence:** Primary inspection of `https://github.com/Hitesh754/Pothole-Vision-main` on both `machine-learning` and `pothole-verify` branches returned 404 for all standard license filenames (`LICENSE`, `LICENSE.md`, `LICENSE.txt`).
- **Mitigation:**
  1. Notify repository owner (`Hitesh754`) to add an open-source license (MIT or Apache-2.0).
  2. Implement backend inference integrations strictly behind an adapter interface with a local mock (`INFERENCE_ADAPTER=stub` with `is_stub=true`).
  3. Prohibit direct imports or bundling of the ML repository into the Meridian codebase until licensed.
- **Handling Prompt:** Prompt 01 (contract setup) & Prompt 14 (inference service).

---

### RSK-02: Host RAM Exhaustion (8 GB Total Host RAM)
- **Likelihood:** High
- **Impact:** Critical (Host freezing, out-of-memory container crashes)
- **Evidence:** `Get-CimInstance Win32_OperatingSystem` measured 8,065,780 KB total RAM (~7.69 GB physical) with only ~1.00 GB free under baseline Windows operations. PostgreSQL, NATS, MinIO, Valhalla, Nominatim, Next.js, and Metro running simultaneously would demand > 12 GB RAM.
- **Mitigation:**
  1. Bound target dataset strictly to a single-city extract (< 100 MB OSM PBF).
  2. Run data generation tools (Planetiler and Valhalla tile builder) sequentially as offline batch jobs, terminating them before launching runtime services.
  3. Bound Docker Desktop WSL2 memory limit to 4 GB in `.wslconfig`.
  4. Use lightweight alternatives where possible (e.g. SeaweedFS instead of MinIO, Photon or mock geocoder in dev).
- **Handling Prompt:** Prompt 02 (infra compose) & Prompt 08 (data ingestion).

---

### RSK-03: Docker & WSL2 Missing on Host Machine
- **Likelihood:** High
- **Impact:** High (Inability to execute Docker Compose or backend integration tests)
- **Evidence:** `docker : The term 'docker' is not recognized` and `wsl.exe --status` reported WSL is not installed.
- **Mitigation:**
  - The developer must install WSL2 (`wsl.exe --install`) and Docker Desktop for Windows with WSL2 backend before proceeding with Prompt 02.
  - Verification checklist added to `open-questions.md`.
- **Handling Prompt:** Prompt 01 (developer action gating Prompt 02).

---

### RSK-04: Expo Go Incompatibility with `@maplibre/maplibre-react-native`
- **Likelihood:** High (100% design constraint)
- **Impact:** High (Standard Expo Go mobile testing will crash)
- **Evidence:** `@maplibre/maplibre-react-native` peer dependencies require native compiled code (C++/Java/Obj-C) and New Architecture. Expo Go does not bundle MapLibre Native SDK.
- **Mitigation:**
  - Standardize mobile testing workflow on Expo Development Builds (`npx expo run:android` or EAS development builds with `expo-dev-client`).
  - Document explicitly in mobile guidelines and developer onboarding.
- **Handling Prompt:** Prompt 01 (monorepo structure) & Prompt 04 (mobile app setup).

---

### RSK-05: Port 8081 Metro Collisions
- **Likelihood:** High
- **Impact:** Medium (Metro bundler fails to start or hijacks Nominatim traffic)
- **Evidence:** React Native Metro bundler runs on port 8081 by default. Nominatim was tentatively slated for port 8081.
- **Mitigation:**
  - Rebind Nominatim host port in `docker-compose.yml` to **8083**.
  - Keep Metro on 8081 or pass `--port 8084` if conflicts arise.
- **Handling Prompt:** Prompt 02 (Docker Compose configuration).

---

### RSK-06: Nominatim Heavy Import Resource Requirements
- **Likelihood:** High
- **Impact:** High (Nominatim container will OOM during database indexing)
- **Evidence:** Nominatim documentation specifies 4 GB RAM minimum for any extract; state extracts require 32 GB – 64 GB RAM.
- **Mitigation:**
  - Configure `--osm2pgsql-cache 1024` and `--threads 2` during city extract import.
  - Provide fallback configuration to Photon (`komoot/photon`) or a lightweight mock geocoding service for quick offline dev.
- **Handling Prompt:** Prompt 02 & Prompt 08.

---

### RSK-07: Administrative Boundary Depiction Legal Sensitivity
- **Likelihood:** Medium
- **Impact:** Critical (Legal penalties under mapping regulations)
- **Evidence:** If the target region is in India (or jurisdictions with strict border regulations such as the Criminal Law Amendment Act 1961 and Survey of India Guidelines), depicting incorrect external boundaries of the country is a non-bailable offense.
- **Mitigation:**
  - Default target region to a localized municipality / city boundary (e.g. Vadodara or Berlin) that does not intersect international borders.
  - If country-scale rendering is ever attempted for India, use official Survey of India boundary layers rather than unverified raw OSM international boundary relations.
- **Handling Prompt:** Prompt 03 (PMTiles generation) & Prompt 10 (Map styles).

---

### RSK-08: Personal Data & Privacy in Road Hazard Observations
- **Likelihood:** High
- **Impact:** High (Violation of GDPR / DPDP Act 2023)
- **Evidence:** User-submitted photos of potholes or road hazards routinely capture pedestrian faces, vehicle license plates, and precision timestamped GPS trajectories.
- **Mitigation:**
  1. Strip EXIF metadata from uploaded images before persisting to S3.
  2. Pass images through privacy anonymization (blurring faces and number plates) during verification pipeline.
  3. Coarsen raw GPS coordinates when displaying public observations; do not expose private submission trajectories.
- **Handling Prompt:** Prompt 05 (observation ingestion) & Prompt 12 (verification pipeline).

---

### RSK-09: Windows CRLF Line-Ending Warnings
- **Likelihood:** High
- **Impact:** Low (Git diff noise, shell script execution failure inside Linux containers)
- **Evidence:** `git status` displayed: `warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it`.
- **Mitigation:**
  - Configure `.gitattributes` with `* text=auto eol=lf` so all shell scripts, migrations, and source files maintain LF line endings even on Windows.
- **Handling Prompt:** Prompt 01.

---

### RSK-10: cgo Compilation in Container Builds (Resolved)
- **Likelihood:** Low
- **Impact:** Medium
- **Evidence:** `github.com/uber/h3-go/v4` v4.6.0 is now **Pure Go**. It compiles with `CGO_ENABLED=0`.
- **Mitigation:** Verified that no C toolchain or cross-compilation environment is required for Go backend Docker containers. Scratch / Alpine minimal Docker images can be used cleanly.
- **Handling Prompt:** Resolved; verified in Prompt 00.
