# Phase Report: Prompt 02W — Windows Resource Baseline & Operational Runbook

**Date:** 2026-11-23  
**Status:** COMPLETE  
**Host Environment:** Windows 11 Home 64-bit, 8 GB Physical RAM, Docker Desktop 29.9.3 (WSL2 v2)  

---

## 1. Executive Summary

Prompt 02W establishes the Windows 11 host resource constraints, verification script, and operational runbook for running memory-intensive geospatial tooling (Osmium, Planetiler, PMTiles, Valhalla, Nominatim) within an 8 GB physical memory envelope.

---

## 2. Host Resource Audit Findings

Execution of `scripts/windows/check-resources.ps1`:
- **Physical Memory:** 7.69 GB Total Visible. Free RAM measured at ~0.72 GB with development tooling and Compose running.
- **Disk Storage (Drive C:):** 30.91 GB free. Sufficient for raw PBF downloads, intermediate Osmium clips, and Planetiler temp files.
- **Docker Desktop Engine:** 29.9.3 active on WSL2 backend.

---

## 3. Operational Windows Runbook for Geospatial Tasks

1. **Isolation Rule:**
   - Prior to launching Osmium clipping or Planetiler basemap builds, stop the core application stack:
     ```powershell
     pnpm dev:stack:down
     ```
2. **Memory Allocation:**
   - Planetiler must be invoked with `-Xmx3g` or `-Xmx4g` limit inside Docker to prevent WSL2 vmmem out-of-memory killing.
3. **Region Scope Constraint:**
   - Due to the 8 GB host envelope, extracts must strictly be single-city / metropolitan bounding boxes (< 100 MB OSM PBF). State or national extracts (e.g. India or California) are prohibited.
