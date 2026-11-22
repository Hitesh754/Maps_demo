# ADR-0020: Observability Strategy (Structured slog JSON and OpenTelemetry Tracing/Metrics)

## Context
Unstructured text logs (e.g. `log.Println("error happened")`) cannot be parsed reliably by log aggregators, while fragmented metrics make diagnosing spatial query bottlenecks and message delivery failures impossible. Meridian requires modern, cloud-native observability standards.

## Decision
We establish a comprehensive observability framework using Go's standard library and OpenTelemetry:

1. **Structured Logging (`log/slog`):**
   - All Go binaries emit logs strictly as JSON to stdout using the standard library `log/slog` package.
   - Every log record includes mandatory contextual attributes:
     - `time` (RFC 3339 UTC)
     - `level` (`DEBUG`, `INFO`, `WARN`, `ERROR`)
     - `msg` (Human-readable event description)
     - `trace_id` and `span_id` (OpenTelemetry correlation)
     - `component` (Subsystem name, e.g. `api.router`, `worker.events`)
     - `error` (Structured error stack when level is ERROR)
2. **Distributed Tracing & Metrics (OpenTelemetry Go SDK):**
   - We adopt `go.opentelemetry.io/otel` (v1.47.0, Apache-2.0, verified in Prompt 00).
   - Inbound HTTP requests and WebSocket connections are wrapped with OpenTelemetry middleware to track latency, HTTP status codes, and active connection counts.
   - Database queries (`pgxpool`) and NATS JetStream message handoffs propagate trace context headers (`traceparent`), enabling end-to-end trace correlation from HTTP ingestion to background worker processing.
3. **Health Checks:**
   - Standard HTTP endpoints: `GET /healthz` (liveness probe) and `GET /readyz` (readiness probe checking PostgreSQL and NATS ping).

## Alternatives considered
- **Logrus / Zap:** Standard library `log/slog` (introduced in Go 1.21) provides zero-allocation structured JSON logging without adding external logging dependencies.
- **Prometheus Direct Client:** OpenTelemetry metrics API provides vendor-neutral metrics collection with export capabilities to Prometheus, OTLP, or Grafana.

## Consequences
- **Positive:** Production-ready observability, unified trace correlation across asynchronous outbox boundaries, zero external logging dependencies.
- **Negative:** Handlers must pass `context.Context` systematically to ensure trace context is propagated across function boundaries.

## Evidence/links
- `docs/recon/compatibility-matrix.md` (`go.opentelemetry.io/otel` v1.47.0)
- Go Standard Library `log/slog` Documentation

## Status
Approved
