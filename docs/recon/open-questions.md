# Platform Open Questions & Decision Log

**Date:** 2026-11-22  
**Platform Codename:** Meridian  
**Investigator:** Principal Software Architect and Release Engineer  

The following architectural and operational decisions require human confirmation or action before or during subsequent prompts. A recommended default is provided for each.

---

## 1. Decision Register

### Q1: What is the initial TARGET_REGION for geospatial data extracts?
- **Current State:** Unknown / unconfigured in environment.
- **Context:** Due to the measured 8 GB physical host RAM budget, state-scale extracts (e.g. California or Maharashtra) will cause host RAM exhaustion. A single-city or metropolitan extract (< 100 MB OSM PBF) is mandatory.
- **Options:**
  1. *Option A (Recommended):* **Vadodara, Gujarat, India** (or a single Indian metropolitan area if building local road intelligence).
  2. *Option B:* **Berlin, Germany** (standard international benchmark dataset from Geofabrik, ~55 MB PBF, well-formed OSM tags).
  3. *Option C:* **Monaco / Liechtenstein** (< 10 MB PBF, instant processing for sub-minute test cycles).
- **Recommended Default:** **Option A (or Option B for benchmark testing)**. Use a Geofabrik city/metro bounding box extract under 100 MB.

---

### Q2: How should the ML repository unlicenced status be addressed?
- **Current State:** Inspection of `https://github.com/Hitesh754/Pothole-Vision-main` confirmed that neither `machine-learning` nor `pothole-verify` contains a LICENSE file.
- **Context:** Without an explicit license grant, third-party distribution or derivative integration is legally prohibited.
- **Options:**
  1. *Option A (Recommended):* **Request the repository owner commit an MIT or Apache-2.0 license** to both `machine-learning` and `pothole-verify` branches immediately.
  2. *Option B:* Maintain a clean architectural abstraction where Meridian communicates strictly through an HTTP inference interface, utilizing `INFERENCE_ADAPTER=stub` with `is_stub=true` until written license grant is delivered.
- **Recommended Default:** **Option A combined with Option B**. The developer asks the friend/owner to add `LICENSE` (MIT), while Meridian code relies on the stub adapter during early development phases.

---

### Q3: S3-Compatible Storage for Docker Compose (MinIO vs Alternatives)
- **Current State:** MinIO discontinued publishing free community container images to Docker Hub and Quay.io.
- **Options:**
  1. *Option A (Recommended):* **SeaweedFS (`chrislusf/seaweedfs`)**. Apache-2.0 licensed, fast, extremely lightweight (~150 MB RAM), full S3 API support, ideal for Docker Compose dev environments.
  2. *Option B:* **Chainguard MinIO Image (`cgr.dev/chainguard/minio`)**. Free tier community MinIO binary image.
  3. *Option C:* **LocalStack (`localstack/localstack`)**. Full AWS emulation, but heavier RAM footprint (~1 GB).
- **Recommended Default:** **Option A (SeaweedFS)** with standard AWS Go SDK v2 (`github.com/aws/aws-sdk-go-v2/service/s3`). The Go backend code is 100% cloud-standard S3 and requires zero MinIO-specific proprietary SDKs.

---

### Q4: Host Machine Prerequisites Installation (Developer Action)
- **Current State:** Docker, WSL2, and Go are not installed in the Windows host PATH. pnpm corepack shim is malfunctioning.
- **Required Developer Actions:**
  1. **Install WSL2 & Docker Desktop:** Run `wsl --install` in an elevated terminal and install Docker Desktop for Windows (enable WSL2 backend). Allocate 4 GB RAM in `%USERPROFILE%\.wslconfig`.
  2. **Install Go:** Download and run the official Go 1.24/1.25 Windows installer from `https://go.dev/dl/`.
  3. **Fix pnpm:** Run `npm install -g pnpm@latest` to install the standalone `pnpm` binary and bypass the broken corepack shim.
- **Recommended Default:** Complete these installations prior to executing Prompt 01/02.

---

### Q5: Nominatim Geocoding Strategy in Local Development
- **Current State:** Nominatim requires minimum 4 GB RAM for import and collided with Metro on port 8081.
- **Options:**
  1. *Option A (Recommended):* Rebind Nominatim container port to **8083**, restrict import cache to `--osm2pgsql-cache 1024`, and only import a city extract.
  2. *Option B:* Use a mock geocoding adapter or lightweight Photon container (`komoot/photon`) for daily dev to preserve RAM for other services.
- **Recommended Default:** **Option A** with **Option B** fallback if host RAM pressure is too severe.
