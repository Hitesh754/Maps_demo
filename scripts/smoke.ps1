# Meridian Compose Smoke Test (PowerShell)
$ErrorActionPreference = "Stop"

$ComposeFile = "infra/compose/docker-compose.yml"
$EnvFile = ".env.example"
$ApiUrl = "http://127.0.0.1:8080"

Write-Host "=========================================================="
Write-Host "Starting Meridian Docker Compose Smoke Test..."
Write-Host "=========================================================="

# 1. Bring up stack
Write-Host "1. Bringing up Compose services..."
docker compose -f $ComposeFile --env-file $EnvFile up -d --build

# 2. Wait for API readiness (up to 60s)
Write-Host "2. Waiting for http://127.0.0.1:8080/readyz to report healthy (200)..."
$MaxAttempts = 30
$Healthy = $false

for ($i = 1; $i -le $MaxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/readyz" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   Readiness verified: 200 OK after $i attempts."
            Write-Host "   Body: $($response.Content)"
            $Healthy = $true
            break
        }
    } catch {
        # continue waiting
    }
    Start-Sleep -Seconds 2
}

if (-not $Healthy) {
    Write-Error "Timeout waiting for /readyz to return 200 OK. Dumping container logs..."
    docker compose -f $ComposeFile logs
    exit 1
}

# 3. Simulate NATS failure
Write-Host "3. Stopping NATS container to simulate dependency outage..."
docker compose -f $ComposeFile stop nats

# 4. Verify /readyz returns 503 and RFC 9457 problem details naming nats
Write-Host "4. Verifying /readyz returns 503 Service Unavailable with problem+json..."
Start-Sleep -Seconds 2

$rawOutput = & curl.exe -s -w "`n%{http_code}" "$ApiUrl/readyz"
$lines = $rawOutput -split "`n"
$statusCode = ($lines[-1]).Trim()
$body = ($lines[0..($lines.Length - 2)] -join "`n").Trim()

if ($statusCode -eq "503" -and $body -match "nats") {
    Write-Host "   Degraded state verified: HTTP 503 with body naming nats."
    Write-Host "   Problem Body: $body"
} else {
    Write-Error "Unexpected response during outage: status=$statusCode, body=$body"
    exit 1
}

# 5. Restore NATS
Write-Host "5. Restoring NATS service..."
docker compose -f $ComposeFile start nats
Start-Sleep -Seconds 3

# 6. Verify recovery to 200 OK
Write-Host "6. Verifying /readyz recovery to 200 OK..."
$Recovered = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/readyz" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   Recovery verified: 200 OK"
            $Recovered = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
}

if (-not $Recovered) {
    Write-Error "Failed to recover to 200 OK after restarting NATS."
    exit 1
}

Write-Host "=========================================================="
Write-Host "SMOKE TEST PASSED: Full lifecycle and outage tested."
Write-Host "=========================================================="
