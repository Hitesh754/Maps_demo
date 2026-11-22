# ADR-0010: Authentication and Authorization Architecture

## Context
Meridian serves diverse consumer classes: anonymous citizen drivers submitting hazards, registered community verifiers, municipal moderation staff, and third-party developer integrations. The authentication mechanism must be secure against token theft, support mobile secure storage and browser cross-site scripting (XSS) protections, and provide granular role-based access control.

## Decision
We implement a multi-tiered authentication and authorization system:

1. **Password Hashing:**
   - User credentials are encrypted using **Argon2id** (`golang.org/x/crypto/argon2`) with OWASP-recommended parameters: $m=64\text{ MB}$, $t=3\text{ iterations}$, $p=4\text{ threads}$.
2. **Access & Refresh Tokens:**
   - **Access Token:** Short-lived asymmetric JWT (15-minute expiry) signed with Ed25519 or HMAC-SHA256, carrying user ID, role (`user`, `moderator`, `admin`), and session ID.
   - **Refresh Token:** High-entropy random cryptographic token (30-day expiry) stored as a SHA-256 hash in PostgreSQL.
   - **Storage Policy:**
     - Web Clients: Refresh token stored in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie.
     - Mobile Clients: Refresh token stored in hardware-backed secure storage via `expo-secure-store`.
   - **Rotation:** Refresh tokens are single-use; each refresh request issues a new token pair and revokes the predecessor. Reuse of an old refresh token invalidates the entire session family (theft detection).
3. **Developer API Keys:**
   - Third-party spatial APIs authenticate via HTTP header `X-API-Key: mrd_live_<32_random_bytes>`.
   - The plaintext key is shown only once at creation; only its SHA-256 hash is persisted in the `api_keys` table.
4. **Role-Based Access Control (RBAC):**
   - Endpoints are gated by middleware enforcing roles: `anonymous`, `user`, `moderator`, `admin`.

## Alternatives considered
- **Stateful Server-Side Sessions in Redis:** Rejected because the platform is designed to avoid external Redis dependencies in the MVP, and JWTs permit stateless horizontal API scaling.
- **Long-Lived Bearer JWTs:** Rejected due to security risks: an exposed long-lived JWT cannot be revoked immediately without central blacklist lookups.

## Consequences
- **Positive:** Robust defense against token leakage, zero state required for access token validation, hardware-backed mobile security, standard developer API key model.
- **Negative:** Mobile and web clients must handle automatic background token refresh when access tokens expire.

## Evidence/links
- OWASP Password Storage Cheat Sheet: Argon2id
- RFC 9068 (JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens)
- `docs/architecture/domain-model.md`

## Status
Approved
