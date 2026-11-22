# scripts/windows/check-resources.ps1
# Host resource verification for Windows 11 + Docker Desktop (WSL2)
# Used before running heavy geospatial workloads (osmium, Planetiler, PMTiles)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Meridian Host System & Resource Check (Windows 11 / WSL2)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Physical RAM
$os = Get-CimInstance Win32_OperatingSystem
$totalRamGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeRamGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedRamGB = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 2)

Write-Host "`n[Memory Budget]" -ForegroundColor Yellow
Write-Host "  Total Physical RAM : $totalRamGB GB"
Write-Host "  Free Physical RAM  : $freeRamGB GB"
Write-Host "  Used RAM           : $usedRamGB GB"

# 2. Storage / Disk Space
$driveC = Get-PSDrive C
$freeDiskGB = [math]::Round($driveC.Free / 1GB, 2)

Write-Host "`n[Disk Budget]" -ForegroundColor Yellow
Write-Host "  Drive C: Free Space: $freeDiskGB GB"

# 3. Docker Status
Write-Host "`n[Docker Engine]" -ForegroundColor Yellow
try {
    $dockerInfo = docker info --format '{{.ServerVersion}} (WSL2: {{.OperatingSystem}})' 2>$null
    if ($dockerInfo) {
        Write-Host "  Docker Daemon      : RUNNING ($dockerInfo)" -ForegroundColor Green
    } else {
        Write-Host "  Docker Daemon      : STOPPED or Unresponsive" -ForegroundColor Red
    }
} catch {
    Write-Host "  Docker Daemon      : NOT FOUND or ERROR" -ForegroundColor Red
}

# 4. Resource Verdict for Planetiler / OSM Pipeline
Write-Host "`n[Verdict for Geospatial Pipeline]" -ForegroundColor Yellow
$sufficient = $true

if ($totalRamGB -lt 7.0) {
    Write-Host "  [WARN] Total RAM ($totalRamGB GB) is below 8 GB. Only small city extracts (< 50 MB PBF) should be processed." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] Physical RAM ($totalRamGB GB) meets minimum 8 GB target." -ForegroundColor Green
}

if ($freeRamGB -lt 2.0) {
    Write-Host "  [WARN] Free RAM ($freeRamGB GB) is low (< 2 GB). Stop non-essential background containers and browser tabs before building tiles." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] Free RAM ($freeRamGB GB) is sufficient for initial pipeline steps." -ForegroundColor Green
}

if ($freeDiskGB -lt 15.0) {
    Write-Host "  [FAIL] Free disk space ($freeDiskGB GB) is below 15 GB minimum required for raw PBF, temp files, and water polygons." -ForegroundColor Red
    $sufficient = $false
} else {
    Write-Host "  [OK] Free disk space ($freeDiskGB GB) is sufficient (>= 15 GB)." -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Cyan
if ($sufficient) {
    Write-Host "VERDICT: Host resources SUFFICIENT for single-city extract (< 100 MB PBF)." -ForegroundColor Green
} else {
    Write-Host "VERDICT: Host resources INSUFFICIENT. Free disk space or RAM must be addressed." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
