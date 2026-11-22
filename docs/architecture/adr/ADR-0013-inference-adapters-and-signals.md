# ADR-0013: AI Inference Adapters, Stub Modes, and Independent Verification Signals

## Context
Meridian utilizes external machine learning models for hazard detection (pothole recognition) and image authenticity verification from an external repository (`Pothole-Vision-main`). As established in Prompt 00, this external repository contains no open-source license, and machine learning models are inherently prone to downtime, network latency, or false classifications. Directly coupling core backend ingestion to external ML HTTP services violates architectural resilience and copyright isolation.

## Decision
1. **Inference Adapter Boundary:**
   - The Go backend interacts with inference services strictly through an internal Go interface (`InferenceAdapter`) defined in `internal/inference`.
   - The core observation submission pipeline **never waits synchronously** for ML inference. Observations are committed immediately to PostgreSQL and an asynchronous event is emitted to NATS JetStream.
2. **Mandatory Stub Mode:**
   - A deterministic stub implementation is provided behind configuration `INFERENCE_ADAPTER=stub`.
   - When active, the stub returns synthetic predictions with an explicit flag: `is_stub: true`.
   - Production builds enforce that stub responses are clearly tagged in logs and audits to prevent mock data masquerading as live predictions.
3. **Independent Verification Signals:**
   - Inference outputs are recorded as discrete, independent rows in `event_signals` (`signal_type = 'ai_detection'` or `'authenticity'`).
   - If an ML model is offline or times out, the signal is recorded with `status: 'unavailable'` or `'pending'`.
   - **Model downtime is never silently treated as a negative result (no pothole).**
   - Verification states (`verification_state`) are derived through a deterministic state machine that tolerates missing or delayed inference signals.

## Alternatives considered
- **Synchronous ML Inference in HTTP Request:** Rejected because external Python/PyTorch inference latency (1–5 seconds) would degrade mobile submission response times and fail completely if ML containers crash.
- **Blending ML Confidence into a Single Hazard Trust Score:** Rejected because blending AI confidence with user votes conceals the provenance of data and makes debugging false positives impossible.

## Consequences
- **Positive:** Zero impact of ML downtime on hazard reporting; legal and technical isolation from external ML code; deterministic local testing via stub adapter.
- **Negative:** Event verification is asynchronous; mobile clients receive an immediate `202 Accepted` and must observe status transitions via WebSocket or subsequent polling.

## Evidence/links
- `docs/recon/licences.md` (Audit of `Pothole-Vision-main`)
- `docs/architecture/signals-and-verification-policy.md`

## Status
Approved
