# Decisions Needed

This document records pending architectural and project governance decisions required from the project owner or human maintainer.

---

## 1. Project Software License

- **Current Status:** Pending decision.
- **Context:** Neither the root workspace nor `docs/recon/open-questions.md` specifies an explicit outbound license (e.g. Apache-2.0, MIT, Proprietary/Commercial).
- **Impact:** Per Prompt 02 Task 7.1, no `LICENSE` file is committed until the maintainer formally specifies the target license.
- **Action Required:** Determine the project license model (e.g., Apache-2.0, MIT, or All Rights Reserved / Proprietary) and create the root `LICENSE` file.

---

## 2. Target Region for Geospatial Extracts

- **Current Status:** Recommended default: Vadodara, Gujarat, India (or single-city Geofabrik extract < 100 MB).
- **Context:** Prompt 03 will require the exact region configuration (`REGION_EXTRACT_URL`, `REGION_BBOX`).
- **Action Required:** Confirm the region coordinates and extract source prior to Prompt 03.

---

## 3. ML Repository Upstream License

- **Current Status:** Pending upstream commit from `https://github.com/Hitesh754/Pothole-Vision-main` (`machine-learning` and `pothole-verify` branches).
- **Context:** Meridian interfaces with inference services via HTTP adapters (`INFERENCE_ADAPTER=stub` default), preserving full clean-room boundary until licensing is settled.
- **Action Required:** Confirm upstream licensing status before deploying real inference weights.
