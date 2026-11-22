# scripts/region/build-region.ps1
# End-to-end acquisition, clipping, and basemap tile generation pipeline

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Meridian Region Data Pipeline & Basemap Tile Generation" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 0: Ensure Compose containers are stopped to free RAM for Planetiler
Write-Host "`n[Step 0/4] Freeing host memory (stopping background containers)..." -ForegroundColor Yellow
docker compose -f infra/compose/docker-compose.yml stop 2>$null

# Step 1: Resource verification
Write-Host "`n[Step 1/4] Checking host resources..." -ForegroundColor Yellow
& powershell -ExecutionPolicy Bypass -File scripts/windows/check-resources.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Resource check failed or indicated unsafe conditions."
    exit 1
}

# Step 2: Validate region configuration
Write-Host "`n[Step 2/4] Validating region configuration..." -ForegroundColor Yellow
node scripts/region/validate-region.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Region configuration validation failed."
    exit 1
}

# Step 3: Acquire extract from Geofabrik
Write-Host "`n[Step 3/4] Acquiring OSM extract..." -ForegroundColor Yellow
node scripts/region/acquire.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Extract acquisition failed."
    exit 1
}

# Step 4: Clip extract using osmium
Write-Host "`n[Step 4a/4] Clipping extract with osmium-tool..." -ForegroundColor Yellow
node scripts/region/clip.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Extract clipping failed."
    exit 1
}

# Step 5: Build PMTiles with Planetiler
Write-Host "`n[Step 4b/4] Building PMTiles with Planetiler..." -ForegroundColor Yellow
node scripts/region/build-pmtiles.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Error "Planetiler basemap build failed."
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "Region Data Pipeline Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

Get-ChildItem -Path data/region, data/tiles | Format-Table Name, Length, LastWriteTime
