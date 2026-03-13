## Backend TODO (highest priority first)

✅ 1) Ship config safely  
- Done: `.env.example` added and runtime config validation via `src/config.ts`.

2) Make Mongo transactions reliable  
- Add mongo-init script/sidecar to run `rs.initiate` automatically; mount in compose.  
- Add Mongo PRIMARY wait healthcheck so server starts only after RS ready.

3) Harden auth & tokens  
- Replace custom JWT with a vetted lib (`jose`/`jsonwebtoken`) incl. iss/aud/nbf, alg check, clock tolerance.  
- Add refresh-token rotation with reuse detection + logout blacklist (Redis).  
- Add login-specific rate limiter keyed by email/IP; strengthen password policy/breach check (HIBP or zxcvbn).

4) Fix missing 404 handling  
- Controllers/services should return 404 for absent product/order/category/cart resources instead of `ok(null)`.

5) Complete and secure payments  
- Implement real Stripe PaymentIntent + webhook verification.  
- PayWay pushback: verify signature/shared secret, add idempotency/replay guard, persist webhook event log.  
- Add payment integration tests (mock axios/webhooks).

6) CI/CD & quality gates  
- Add GitHub Actions (npm ci, lint, test, build, docker build).  
- Introduce ESLint/Prettier configs and enforce in CI.

7) Add integration test suite  
- supertest + mongodb-memory-server (or test DB) covering auth → cart → order → payment happy paths and RBAC.

8) Complete API documentation  
- Expand OpenAPI with request bodies, params, response schemas, errors, securitySchemes; generate from source (zod-to-openapi) and publish via Swagger UI.

9) Observability & operations  
- Health endpoint should check Mongo/Redis.  
- Add metrics (Prometheus/OpenTelemetry), structured logs with requestId correlation, log level config, and log rotation/transport.

10) Container & deployment hardening  
- Multi-stage Dockerfile, `npm ci --only=production`, non-root user, smaller image; add server healthcheck in compose.  
- Decide on Redis: use for rate limits/cache/session (and JWT blacklist) or drop it; if kept, switch rate limiter to Redis store.

11) Data validation and integrity  
- Stronger phone/address validation (country aware), enforce unique category slug in service, validate deviceId via middleware, tighten product/category update schemas.

12) Security enhancements  
- Email verification flow, optional TOTP 2FA, password reset flow, audit logging for auth/admin actions.

13) Performance & caching  
- Review indexes (products search/sort, orders by user/status); add caching for product lists and category lookups; consider pagination with consistent cursors.

14) Portfolio polish  
- Add mock/sandbox payment mode for demos, richer seed data, and README updates with clear setup/run/test instructions and diagrams.
