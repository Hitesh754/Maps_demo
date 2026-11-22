# ADR-0012: Transactional Outbox Pattern with NATS JetStream and Dead-Letter Queue

## Context
In distributed event architectures, publishing messages directly to a message broker during an HTTP request creates a dual-write vulnerability: if the database transaction commits but the network call to the message broker fails, the event is lost. Conversely, if the message is published but the database transaction rolls back, phantom events are emitted.

## Decision
1. We implement the **Transactional Outbox Pattern** across all state-mutating operations:
   - When an observation or geo-event is created or updated, the business row and an event record in the `outbox` table are inserted within the **exact same ACID PostgreSQL transaction**.
2. **Outbox Relay Daemon:**
   - An asynchronous loop in `cmd/api` continuously polls pending outbox records using `SELECT ... FOR UPDATE SKIP LOCKED` and publishes them to **NATS JetStream**.
   - Upon successful publication confirmation from NATS JetStream, the outbox record is marked with `published_at = NOW()` or deleted.
3. **Idempotent Consumers:**
   - All NATS messages carry a unique identifier in the `Nats-Msg-Id` header matching the `outbox.id` (UUIDv7). NATS JetStream automatically performs stream-level deduplication over a configured deduplication window.
   - Consumers record processed message IDs in a `processed_messages` database table with a unique primary key constraint within their execution transaction.
4. **Retry & Dead-Letter Queue (DLQ):**
   - Consumer subscriptions enforce explicit acknowledgment (`AckPolicy.Explicit`).
   - Failed message processing triggers backoff retries (`MaxDeliver: 5`, exponential backoff: 1s, 5s, 15s, 30s, 60s).
   - Messages exceeding `MaxDeliver` are forwarded to a Dead-Letter Stream (`MERIDIAN_DLQ`) accompanied by error diagnostics for administrative inspection and manual requeue.

## Alternatives considered
- **Direct NATS Publish in HTTP Handler:** Rejected due to dual-write data loss and phantom message vulnerabilities.
- **Postgres LISTEN/NOTIFY:** Rejected because LISTEN/NOTIFY lacks message persistence, delivery acknowledgments, rate matching, consumer groups, and backoff replay capabilities provided by NATS JetStream.

## Consequences
- **Positive:** Guaranteed at-least-once delivery, zero data loss during NATS downtime, resilient decoupling between API ingestion and background workers.
- **Negative:** Outbox polling introduces sub-second latency before events hit NATS JetStream; requires outbox table periodic housekeeping.

## Evidence/links
- Chris Richardson: "Pattern: Transactional outbox"
- NATS JetStream Documentation: Guaranteed Delivery & Deduplication

## Status
Approved
