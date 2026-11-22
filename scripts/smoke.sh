#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="infra/compose/docker-compose.yml"
ENV_FILE=".env.example"
API_URL="http://127.0.0.1:8080"

echo "=========================================================="
echo "Starting Meridian Docker Compose Smoke Test..."
echo "=========================================================="

# 1. Bring up stack
echo "1. Bringing up Compose services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build

# 2. Wait for API readiness (up to 60s)
echo "2. Waiting for $API_URL/readyz to report healthy (200)..."
HEALTHY=0
for i in {1..30}; do
  if curl -sf "$API_URL/readyz" > /dev/null; then
    echo "   Readiness verified: 200 OK after $i attempts."
    HEALTHY=1
    break
  fi
  sleep 2
done

if [ "$HEALTHY" -ne 1 ]; then
  echo "Timeout waiting for /readyz to return 200 OK. Dumping container logs..."
  docker compose -f "$COMPOSE_FILE" logs
  exit 1
fi

# 3. Simulate NATS failure
echo "3. Stopping NATS container to simulate dependency outage..."
docker compose -f "$COMPOSE_FILE" stop nats

# 4. Verify /readyz returns 503 and RFC 9457 problem details naming nats
echo "4. Verifying /readyz returns 503 Service Unavailable with problem+json..."
sleep 2
HTTP_STATUS=$(curl -s -o /tmp/readyz_err.json -w "%{http_code}" "$API_URL/readyz" || true)

if [ "$HTTP_STATUS" -eq 503 ] && grep -q "nats" /tmp/readyz_err.json; then
  echo "   Degraded state verified: HTTP 503 with body naming nats."
  cat /tmp/readyz_err.json
  echo ""
else
  echo "Unexpected response during outage: status=$HTTP_STATUS"
  cat /tmp/readyz_err.json || true
  exit 1
fi

# 5. Restore NATS
echo "5. Restoring NATS service..."
docker compose -f "$COMPOSE_FILE" start nats
sleep 3

# 6. Verify recovery to 200 OK
echo "6. Verifying /readyz recovery to 200 OK..."
RECOVERED=0
for i in {1..15}; do
  if curl -sf "$API_URL/readyz" > /dev/null; then
    echo "   Recovery verified: 200 OK"
    RECOVERED=1
    break
  fi
  sleep 2
done

if [ "$RECOVERED" -ne 1 ]; then
  echo "Failed to recover to 200 OK after restarting NATS."
  exit 1
fi

echo "=========================================================="
echo "SMOKE TEST PASSED: Full lifecycle and outage tested."
echo "=========================================================="
