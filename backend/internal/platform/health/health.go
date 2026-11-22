package health

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"meridian/backend/internal/platform/httputil"
)

type DatabasePinger interface {
	Ping(ctx context.Context) error
}

type NATSPinger interface {
	Ping(ctx context.Context) error
}

type S3Pinger interface {
	CheckBucket(ctx context.Context) error
}

type Checker struct {
	db   DatabasePinger
	nats NATSPinger
	s3   S3Pinger
}

func NewChecker(db DatabasePinger, nats NATSPinger, s3 S3Pinger) *Checker {
	return &Checker{
		db:   db,
		nats: nats,
		s3:   s3,
	}
}

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
}

type ReadyChecks struct {
	Postgres bool `json:"postgres"`
	NATS     bool `json:"nats"`
	S3       bool `json:"s3"`
}

type ReadyResponse struct {
	Status    string      `json:"status"`
	Timestamp string      `json:"timestamp"`
	Checks    ReadyChecks `json:"checks"`
}

func (c *Checker) HealthzHandler(w http.ResponseWriter, r *http.Request) {
	resp := HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}

func (c *Checker) ReadyzHandler(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 4*time.Second)
	defer cancel()

	checks := ReadyChecks{}
	var failingDeps []string
	var invalidParams []httputil.InvalidParam
	var mu sync.Mutex
	var wg sync.WaitGroup

	// Check Database
	wg.Add(1)
	go func() {
		defer wg.Done()
		if c.db == nil {
			mu.Lock()
			failingDeps = append(failingDeps, "postgres")
			invalidParams = append(invalidParams, httputil.InvalidParam{Name: "postgres", Reason: "postgres client not initialized"})
			mu.Unlock()
			return
		}
		if err := c.db.Ping(ctx); err != nil {
			mu.Lock()
			failingDeps = append(failingDeps, "postgres")
			invalidParams = append(invalidParams, httputil.InvalidParam{Name: "postgres", Reason: "database ping failed"})
			mu.Unlock()
		} else {
			mu.Lock()
			checks.Postgres = true
			mu.Unlock()
		}
	}()

	// Check NATS
	wg.Add(1)
	go func() {
		defer wg.Done()
		if c.nats == nil {
			mu.Lock()
			failingDeps = append(failingDeps, "nats")
			invalidParams = append(invalidParams, httputil.InvalidParam{Name: "nats", Reason: "nats client not initialized"})
			mu.Unlock()
			return
		}
		if err := c.nats.Ping(ctx); err != nil {
			mu.Lock()
			failingDeps = append(failingDeps, "nats")
			invalidParams = append(invalidParams, httputil.InvalidParam{Name: "nats", Reason: "nats connection check failed"})
			mu.Unlock()
		} else {
			mu.Lock()
			checks.NATS = true
			mu.Unlock()
		}
	}()

	// Check S3
	wg.Add(1)
	go func() {
		defer wg.Done()
		if c.s3 == nil {
			mu.Lock()
			failingDeps = append(failingDeps, "s3")
			invalidParams = append(invalidParams, httputil.InvalidParam{Name: "s3", Reason: "s3 client not initialized"})
			mu.Unlock()
			return
		}
		if err := c.s3.CheckBucket(ctx); err != nil {
			mu.Lock()
			failingDeps = append(failingDeps, "s3")
			invalidParams = append(invalidParams, httputil.InvalidParam{Name: "s3", Reason: "s3 bucket check failed"})
			mu.Unlock()
		} else {
			mu.Lock()
			checks.S3 = true
			mu.Unlock()
		}
	}()

	wg.Wait()

	if len(failingDeps) > 0 {
		detailMsg := fmt.Sprintf("Readiness check failed for: %s", strings.Join(failingDeps, ", "))
		httputil.WriteProblem(w, http.StatusServiceUnavailable, httputil.ProblemDetails{
			Type:          "https://meridian.internal/errors/dependency-unavailable",
			Title:         "Service Unavailable",
			Status:        http.StatusServiceUnavailable,
			Detail:        detailMsg,
			Code:          "DEPENDENCY_UNAVAILABLE",
			Instance:      r.URL.Path,
			InvalidParams: invalidParams,
		})
		return
	}

	resp := ReadyResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Checks:    checks,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
