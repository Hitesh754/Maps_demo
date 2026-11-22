//go:build integration

package health_test

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"testing"
	"time"

	"meridian/backend/internal/platform/config"
	"meridian/backend/internal/platform/database"
	"meridian/backend/internal/platform/health"
)

func TestLiveClusterIntegration(t *testing.T) {
	// Integration test intended to run against live Compose stack
	apiURL := os.Getenv("TEST_API_URL")
	if apiURL == "" {
		apiURL = "http://127.0.0.1:8080"
	}

	client := &http.Client{Timeout: 5 * time.Second}

	t.Run("live healthz returns 200", func(t *testing.T) {
		resp, err := client.Get(apiURL + "/healthz")
		if err != nil {
			t.Fatalf("failed to call /healthz: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected status 200, got %d", resp.StatusCode)
		}
	})

	t.Run("live readyz returns 200 with all dependencies ok", func(t *testing.T) {
		resp, err := client.Get(apiURL + "/readyz")
		if err != nil {
			t.Fatalf("failed to call /readyz: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("expected status 200, got %d", resp.StatusCode)
		}

		var ready health.ReadyResponse
		if err := json.NewDecoder(resp.Body).Decode(&ready); err != nil {
			t.Fatalf("failed to decode json: %v", err)
		}

		if ready.Status != "ok" {
			t.Errorf("expected ready.status ok, got %q", ready.Status)
		}
		if !ready.Checks.Postgres {
			t.Error("expected checks.postgres to be true")
		}
		if !ready.Checks.NATS {
			t.Error("expected checks.nats to be true")
		}
		if !ready.Checks.S3 {
			t.Error("expected checks.s3 to be true")
		}
	})
}
