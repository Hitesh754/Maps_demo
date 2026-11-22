# Meridian Privacy, Licensing & Legal Compliance Architecture

**Document Version:** 1.0.0  
**Status:** Approved  
**Date:** 2026-11-22  
**Platform Codename:** Meridian  

> [!IMPORTANT]
> **DISCLAIMER:** This document outlines engineering architecture, data handling safeguards, and software compliance mechanisms. It does not constitute formal legal counsel. Formal privacy policies, terms of service, and regulatory filings must be reviewed by qualified legal counsel.

---

## 1. Personal Data Inventory & Classification

Meridian processes spatial and visual information that intersects user privacy. The platform classifies personal data into four categories:

| Data Category | Specific Elements | Privacy Sensitivity | Storage Location | Processing Purpose |
| :--- | :--- | :---: | :--- | :--- |
| **User Account Data** | Email, Argon2id password hash, role, trust score | High | PostgreSQL `users` table | User authentication, identity, and moderation permissions. |
| **Network & Session Data** | IP address, User-Agent, refresh token hash | Medium | PostgreSQL `sessions` table | Session management, security audit logging, rate limiting. |
| **Geographic Location Data** | Precision GPS coordinates, heading, speed, location history | High | PostgreSQL `observations`, `event_confirmations` | Pinpointing road hazard locations and spatial deduplication. |
| **Visual Media & EXIF** | Raw hazard photos, embedded EXIF GPS tags, camera metadata, bystanders | High | S3 Private Bucket (`media_assets`) | Image authenticity validation and hazard verification. |

---

## 2. Retention, Sanitization & Deletion Policies

### 2.1. Media Lifecycle & EXIF Sanitization
1. **Raw Ingestion (Private Tier):**
   - Raw photos containing EXIF headers are stored in a private S3 bucket accessible only to the internal media worker.
   - EXIF claims are extracted into `event_signals` within 60 seconds of upload.
   - **Purge Rule:** Raw images are retained in private storage for **30 days** for dispute resolution, after which the raw file is permanently deleted from S3.
2. **Public Derivatives (Sanitized Tier):**
   - Media workers transcode raw photos into optimized WebP images ($1920\times 1080$ max).
   - **100% of EXIF, GPS, and device metadata is stripped** during transcoding.
   - Only sanitized derivative URLs are served to public clients and APIs.

### 2.2. Account Deletion & Right to Be Forgotten
1. When a user requests account deletion (`DELETE /v1/users/me`):
   - The user record in `users` is permanently removed.
   - All active sessions in `sessions` and API keys in `api_keys` are immediately revoked.
   - **Observation Anonymization:** Historical road reports submitted by the user are retained for civic infrastructure continuity, but their foreign key is set to null: `observations.user_id = NULL`. All personal attribution is severed.

---

## 3. Regulatory Compliance: DPDP Act (India) & GDPR Considerations

1. **Lawful Basis & Consent Architecture:**
   - **Explicit Camera & Location Consent:** Mobile clients prompt users via standard OS permission dialogs (`expo-location`, `expo-camera`) explaining the specific operational purpose.
   - **Notice at Ingestion:** The report submission screen explicitly informs the driver: *"Photos submitted will be processed by AI, stripped of personal metadata, and published to the public road hazard map."*
2. **Data Minimization:**
   - Continuous real-time GPS tracking is strictly forbidden in the MVP.
   - Mobile clients only sample location when actively reporting a hazard or querying their immediate viewport.

---

## 4. OpenStreetMap (OSM) ODbL Compliance & Attribution

### 4.1. License Terms (ODbL 1.0)
- Meridian utilizes OpenStreetMap data for basemaps (Planetiler PMTiles), routing graphs (Valhalla), and address lookup (Nominatim).
- Under the **Open Database License (ODbL) 1.0**, public usage mandates prominent, unremovable attribution.

### 4.2. Attribution Implementation Standards:
1. **Interactive Map Canvas (Web & Mobile):**
   - The bottom-right corner of the map canvas must permanently display:
     ```
     © OpenStreetMap contributors © OpenMapTiles
     ```
   - The text must link directly to `https://www.openstreetmap.org/copyright`.
2. **Produced Work vs. Derivative Database:**
   - Vector tiles rendered on the screen and turn-by-turn route calculations are classified as **Produced Works** under ODbL Section 4.3.
   - Producing these works does **not** trigger copyleft for the Meridian application source code, proprietary algorithms, or user-submitted observations.

---

## 5. Administrative Boundary Depiction Compliance

In several international jurisdictions (notably India, under the **Criminal Law Amendment Act, 1961** and the **Survey of India Guidelines**), depicting incorrect external boundaries of the country on a digital map is a non-bailable criminal offense.

### Architectural Mitigation:
1. **Localized Region Extraction:**
   - Meridian is designed to operate on a **single configured metropolitan region** (e.g. Vadodara, Gujarat or Berlin, Germany).
   - The bounding box (`REGION_BBOX`) and extract URL (`REGION_EXTRACT_URL`) are isolated to local municipal boundaries that do not intersect disputed international borders.
2. **Prohibition of Global / Unofficial Boundary Overlays:**
   - If nationwide basemaps for India are ever introduced in future phases, Meridian must consume official Survey of India boundary shapefiles rather than unvetted crowdsourced international boundary relations.

---

## 6. Machine Learning Repository License Status

- **Status:** **UNLICENSED (All Rights Reserved)**
- **Audit Findings (Prompt 00):** Primary source inspection of `https://github.com/Hitesh754/Pothole-Vision-main` on branches `machine-learning` and `pothole-verify` confirmed that neither branch contains a `LICENSE` file.
- **Architectural Safeguards:**
  1. The Meridian codebase contains zero cloned code, submodules, or direct dependencies on `Pothole-Vision-main`.
  2. In Prompt 01 and subsequent backend phases, ML inference is accessed exclusively through a decoupled network adapter interface (`InferenceAdapter`).
  3. A local deterministic stub adapter (`INFERENCE_ADAPTER=stub`, `is_stub=true`) is utilized for all development and testing until an open-source license (MIT/Apache-2.0) is committed to the external repository.
