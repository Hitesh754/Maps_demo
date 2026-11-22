package health

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"meridian/backend/internal/platform/httputil"
)

type fakeDB struct {
	err error
}

func (f *fakeDB) Ping(ctx context.Context) error {
	return f.err
}

type fakeNATS struct {
	err error
}

func (f *fakeNATS) Ping(ctx context.Context) error {
	return f.err
}

type fakeS3 struct {
	err error
}

func (f *fakeS3) CheckBucket(ctx context.Context) error {
	return f.err
}

func TestHealthzHandler(t *testing.T) {
	checker := NewChecker(nil, nil, nil)
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rec := httptest.NewRecorder()

	checker.HealthzHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var resp HealthResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode json: %v", err)
	}
	if resp.Status != "ok" {
		t.Errorf("expected status 'ok', got %q", resp.Status)
	}
}

func TestReadyzHandler(t *testing.T) {
	t.Run("all dependencies healthy", func(t *testing.T) {
		checker := NewChecker(&fakeDB{}, &fakeNATS{}, &fakeS3{})
		req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
		rec := httptest.NewRecorder()

		checker.ReadyzHandler(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var resp ReadyResponse
		if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode json: %v", err)
		}
		if resp.Status != "ok" {
			t.Errorf("expected status 'ok', got %q", resp.Status)
		}
		if !resp.Checks.Postgres || !resp.Checks.NATS || !resp.Checks.S3 {
			t.Errorf("expected all checks true, got %+v", resp.Checks)
		}
	})

	t.Run("nats dependency failing returns 503 problem details", func(t *testing.T) {
		checker := NewChecker(&fakeDB{}, &fakeNATS{err: errors.New("connection closed")}, &fakeS3{})
		req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
		rec := httptest.NewRecorder()

		checker.ReadyzHandler(rec, req)

		if rec.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", rec.Code)
		}

		if ct := rec.Header().Get("Content-Type"); ct != "application/problem+json" {
			t.Errorf("expected Content-Type application/problem+json, got %q", ct)
		}

		var problem httputil.ProblemDetails
		if err := json.NewDecoder(rec.Body).Decode(&problem); err != nil {
			t.Fatalf("failed to decode problem details: %v", err)
		}
		if problem.Status != 503 {
			t.Errorf("expected problem status 503, got %d", problem.Status)
		}
		if problem.Code != "DEPENDENCY_UNAVAILABLE" {
			t.Errorf("expected code DEPENDENCY_UNAVAILABLE, got %q", problem.Code)
		}
		if !strings.Contains(problem.Detail, "nats") {
			t.Errorf("expected detail to mention nats, got %q", problem.Detail)
		}
	})

	t.Run("postgres failing returns 503 problem details", func(t *testing.T) {
		checker := NewChecker(&fakeDB{err: errors.New("timeout")}, &fakeNATS{}, &fakeS3{})
		req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
		rec := httptest.NewRecorder()

		checker.ReadyzHandler(rec, req)

		if rec.Code != http.StatusServiceUnavailable {
			t.Fatalf("expected status 503, got %d", rec.Code)
		}

		var problem httputil.ProblemDetails
		if err := json.NewDecoder(rec.Body).Decode(&problem); err != nil {
			t.Fatalf("failed to decode problem details: %v", err)
		}
		if !strings.Contains(problem.Detail, "postgres") {
			t.Errorf("expected detail to mention postgres, got %q", problem.Detail)
		}
	})
}
