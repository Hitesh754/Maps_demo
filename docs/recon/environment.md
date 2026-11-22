# Developer Environment & Machine Reconnaissance Report

**Date of Reconnaissance:** 2026-11-22  
**Platform Codename:** Meridian  
**Investigator:** Principal Software Architect and Release Engineer  

---

## 1. Operating System & Hardware

| Property | Measured Specification | Source / Command | Verdict |
| :--- | :--- | :--- | :--- |
| **Operating System** | Microsoft Windows 11 Home Single Language (Build 10.0.26300, 64-bit) | `Get-CimInstance Win32_OperatingSystem` | **OK** |
| **CPU Architecture** | x86_64 / 64-bit | `Get-CimInstance Win32_OperatingSystem` | **OK** |
| **CPU Processor** | 12th Gen Intel(R) Core(TM) i5-1235U | `Get-CimInstance Win32_Processor` | **OK** |
| **CPU Cores / Threads** | 10 Physical Cores (2 Performance + 8 Efficient), 12 Logical Processors | `Get-CimInstance Win32_Processor` | **OK** |
| **Total Physical RAM** | 8,065,780 KB (~7.69 GB visible physical memory) | `Get-CimInstance Win32_OperatingSystem` | **RISK** (Strict memory budget) |
| **Free Physical RAM** | 1,047,180 KB (~1.00 GB currently free) | `Get-CimInstance Win32_OperatingSystem` | **RISK** (High host RAM pressure) |
| **Workspace Drive (C:)** | Total: 268.55 GB, Used: 217.48 GB, Free: 51.07 GB | `Get-PSDrive -PSProvider FileSystem` | **OK** (Sufficient for city extract) |
| **Active Shell** | Windows PowerShell 5.1 / PowerShell 7 | Antigravity execution harness | **OK** |

---

## 2. Installed Toolchain & Runtime Versions

| Tool | Installed Path / Status | Version Reported | Verdict | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **git** | `C:\Program Files\Git\cmd\git.exe` | `2.53.0.windows.2` | **OK** | Modern git for Windows installed |
| **Go** | `NOT INSTALLED` in PATH | None | **MISSING** | Mandatory backend compiler; must be installed prior to P01 |
| **Node.js** | `C:\Program Files\nodejs\node.exe` | `v22.15.1` (Current Node 22 LTS line) | **OK** | Meets Node.js 20+ / 22+ requirement |
| **npm** | `C:\Program Files\nodejs\npm.cmd` | `10.9.2` | **OK** | Bundled with Node 22 |
| **pnpm / corepack** | Corepack Shim Present | `Error: Cannot find module pnpm.cjs` | **RISK** | Corepack shim failed to locate pnpm 12.11.2; standalone `pnpm` install recommended |
| **Python 3** | `C:\Users\Hitesh\AppData\Local\Programs\Python\Python314\python.exe` | `Python 3.14.3` | **OK** | Modern Python installed |
| **pip** | In Python site-packages | `pip 26.0.1` | **OK** | Up to date |
| **Docker Engine** | `NOT INSTALLED` in PATH | None | **MISSING** | Mandatory for running Postgres, NATS, Valhalla, etc. |
| **Docker Compose** | `NOT INSTALLED` in PATH | None | **MISSING** | Mandatory for local orchestration |
| **WSL2** | `NOT INSTALLED` (`wsl.exe --status` failed) | None | **MISSING** | Required for Docker Desktop WSL2 backend or native Linux containers |
| **C Compiler (gcc)** | `C:\msys64\ucrt64\bin\gcc.exe` (Rev8, MSYS2) | `gcc.exe (MSYS2) 15.2.0` | **OK** | C compiler present if cgo is ever needed |
| **C Compiler (clang)**| `NOT INSTALLED` in PATH | None | **OK** | GCC is available as fallback |
| **MSVC (cl.exe)** | `NOT INSTALLED` in PATH | None | **OK** | GCC MSYS2 available |
| **Java (JDK)** | `C:\Program Files\Eclipse Adoptium\jdk-25.0.2.10-hotspot\bin\java.exe` | `OpenJDK 25.0.2 LTS (Temurin-25.0.2+10)` | **OK** | Planetiler requires Java 21+; JDK 25 exceeds requirement |
| **curl** | `C:\Windows\System32\curl.exe` | `8.23.0 (Windows libcurl/8.23.0)` | **OK** | Native curl utility available |
| **jq** | `NOT INSTALLED` in PATH | None | **RISK** | CLI JSON parsing helper; Python can be used as fallback |
| **Android SDK / adb**| `NOT INSTALLED` in PATH | None | **RISK** | Android development builds will require Android Studio / SDK or EAS cloud |
| **Make** | `NOT INSTALLED` in PATH | None | **RISK** | PowerShell scripts or `task` / `just` will be needed instead of `make` |

---

## 3. Docker & Virtualization Assessment

- **Docker Daemon:** NOT RUNNING / NOT INSTALLED. Neither `docker` nor `docker-compose` binary was found in PATH or standard installation locations (`C:\Program Files\Docker`).
- **WSL2 Subsystem:** `wsl --status` and `wsl -l -v` confirmed: `"The Windows Subsystem for Linux is not installed."`
- **Implication:**
  - Running Docker Compose locally on Windows requires either installing Docker Desktop with the WSL2 backend (recommended) or Hyper-V backend, or setting up a Linux development VM.
  - Because total host RAM is ~8 GB, Docker Desktop’s WSL2 memory allocation must be strictly bounded in `.wslconfig` (e.g. `memory=4GB`, `swap=4GB`) to avoid starving the Windows host OS.

---

## 4. Planned Port Availability Verification

The planned local development ports were checked using `Get-NetTCPConnection`:

| Planned Port | Service Planned | Current State | Owning Process | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **8080** | Go Backend REST API | Available (Unused) | None | **OK** |
| **3000** | Next.js Web App | Available (Unused) | None | **OK** |
| **5432** | PostgreSQL + PostGIS | Available (Unused) | None | **OK** |
| **4222** | NATS Client Port | Available (Unused) | None | **OK** |
| **8222** | NATS Monitoring HTTP | Available (Unused) | None | **OK** |
| **9000** | MinIO / S3 API | Available (Unused) | None | **OK** |
| **9001** | MinIO Console | Available (Unused) | None | **OK** |
| **8002** | Valhalla Routing API | Available (Unused) | None | **OK** |
| **8081** | Nominatim Geocoding API | Available (Unused) | None | **RISK** (Conflict with React Native Metro!) |
| **8082** | go-pmtiles Vector Tile Server | Available (Unused) | None | **OK** |
| **19000-19002** | Expo / Metro bundler legacy ports | Available (Unused) | None | **OK** |

### Critical Port Conflict Note: Port 8081
- React Native / Metro bundler defaults to port `8081`.
- Nominatim was tentatively planned for port `8081`.
- **Resolution:** Rebind Nominatim to port `8083` or `7070` in `docker-compose.yml` to prevent Metro bundler collisions during mobile app development.

---

## 5. Network Reachability Verification

All critical remote registries and data endpoints were probed with HEAD requests:

| Remote Host | URL Probed | Status Code | Latency / Result | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **npm Registry** | `https://registry.npmjs.org` | HTTP 200 OK | Reachable | **OK** |
| **Go Module Proxy** | `https://proxy.golang.org` | HTTP 200 OK | Reachable | **OK** |
| **Docker Hub** | `https://hub.docker.com` | HTTP 200 OK | Reachable | **OK** |
| **GitHub Container Registry** | `https://ghcr.io` | HTTP 405 Method Not Allowed (Expected for root HEAD) | Reachable | **OK** |
| **GitHub** | `https://github.com` | HTTP 200 OK | Reachable | **OK** |
| **Geofabrik OSM Extracts** | `https://download.geofabrik.de` | HTTP 200 OK | Reachable | **OK** |

---

## 6. Resource Budget Analysis & Feasibility Verdict

### Measured Constraints
- Total Host RAM: 8,065,780 KB (~7.69 GB physical)
- Free Host RAM: ~1.00 GB currently free (under Windows 11 base workload)
- Free Disk Space: 51.07 GB on C:

### Documented Component Memory Requirements (Primary Sources)
1. **PostgreSQL 17 + PostGIS 3.5:** Minimum ~256 MB – 512 MB working memory for small datasets ([PostGIS Docs](https://postgis.net/documentation/)).
2. **NATS Server:** ~30 MB – 60 MB RAM ([NATS Docs](https://docs.nats.io/)).
3. **S3 Storage (MinIO / SeaweedFS):** ~256 MB – 512 MB RAM ([MinIO Docs](https://min.io/docs/minio/linux/index.html)).
4. **Valhalla Routing Engine:**
   - Tile Build Phase (offline batch): Depends directly on PBF size. A small city extract (~50–100 MB OSM PBF) requires ~1.5 GB – 2.5 GB RAM during graph construction ([Valhalla GitHub](https://github.com/valhalla/valhalla)).
   - Runtime Serving Phase: Uses memory-mapped tile files (`mmap`). For a single city, active resident memory is only ~300 MB – 500 MB.
   - For a state-scale extract (e.g. 1.2 GB PBF), tile building requires 8 GB – 16 GB RAM.
5. **Planetiler PMTiles Generator:**
   - Single city extract: Can run with `-Xmx2g` (2 GB JVM heap) ([Planetiler Docs](https://github.com/onthegomap/planetiler)).
   - State-scale extract: Requires minimum 8 GB – 16 GB JVM heap.
6. **Nominatim Geocoding Engine:**
   - Official documentation specifies a hard minimum of **4 GB RAM** for importing even the smallest OSM extract ([Nominatim Import Docs](https://nominatim.org/release-docs/latest/admin/Installation/)).
   - State-scale import requires 32 GB – 64 GB RAM and dozens of gigabytes of disk space.

### Resource Budget Verdict
1. **Single-City Extract (e.g. Monaco, Vadodara, or a single metropolitan bounding box):**
   - **PLAUSIBLE WITH STRICT SEQUENCING.**
   - Total simultaneous runtime serving requirements: Postgres (512 MB) + NATS (50 MB) + S3 (256 MB) + Valhalla serving (500 MB) + go-pmtiles (100 MB) + Go Backend (64 MB) $\approx$ **1.5 GB – 2.0 GB RAM**.
   - Build tools (Planetiler and Valhalla tile builder) **MUST NOT** run concurrently with each other or during heavy developer operations. They must be executed sequentially as offline, one-off generator tasks.
   - For Nominatim: Full Nominatim indexing requires $\ge$ 4 GB RAM alone. On an 8 GB host, Nominatim import will push the machine to its absolute physical limits. Mitigation: run Nominatim with `--osm2pgsql-cache 1024`, or use Photon / a lightweight SQLite geocoder mock in local development.
2. **State-Scale Extract (e.g. California, Bavaria, Maharashtra):**
   - **COMPLETELY INFEASIBLE on this machine.**
   - Valhalla tile build (8–16 GB), Planetiler (8–16 GB), and Nominatim import (32–64 GB) all exceed the total physical memory of the machine by 200% to 800%. State-scale extracts would trigger severe Windows thrashing or process crashes.
