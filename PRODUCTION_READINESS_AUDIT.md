# PRODUCTION_READINESS_AUDIT.md

## RC Verification Update (2026-03-10)
- Production readiness score: **89/100** (up from **72/100** in the prior pass).
- Release gate status: **green**.
- Completed in this pass:
  - Repaired test harness failures (Jest ESM/cache instability, integration setup drift, helper typing/logging issues).
  - Restored auth hardening coverage (refresh-reuse, blacklist fail-closed, HIBP pass/fail/unavailable, logout invalidation).
  - Restored payment/webhook hardening coverage (Stripe signature and duplicate handling, PayWay signature and idempotency handling).
  - Standardized email normalization (`trim + lowercase`) across auth registration/login/repo lookup and login rate-limit keys.
- Verification artifact:
  - `npm run lint` passed.
  - `npm test -- --runInBand` passed (**21 suites, 49 tests**).
  - `npm run build` was already green from the prior blocker-fix pass.

## A. Tech stack detected
- Node.js 20, TypeScript (ESM)
- Express 4, Mongoose 8 (MongoDB), Redis client
- Auth: jose JWT, bcrypt, zod validation, express-rate-limit, zxcvbn
- Payments: Stripe SDK, PayWay (axios)
- Tooling: tsx, ts-jest/Jest, supertest, Docker/Compose, Pino HTTP, Helmet, CORS, Swagger UI

## B. Folder / module map
- `server/src/index.ts` – entrypoint: env load, connect Mongo/Redis, start server
- `server/src/app.ts` – middleware stack, rate limit, Swagger, routes, health
- `src/infra` – Mongo/Redis connectors
- `src/middlewares` – auth, requestId, error/notFound
- `src/models` – User, Product, Category, Cart, Order, RefreshSession, PaymentWebhookLog
- `src/repositories` – data access wrappers
- `src/services` – auth, catalog, cart, order, payment (Stripe, PayWay)
- `src/controllers` – HTTP handlers
- `src/routes` – route modules
- `src/validators` – zod schemas
- `src/utils` – config, jwt, token blacklist, idempotency, apiResponse
- `tests` – unit tests for auth, cart, payment rate-limit, etc.
- Docker: `Dockerfile`, `docker-compose.yml`, `docker/mongo-init.js`
- Docs: `src/docs/openapi.json`
- Seeds: `src/scripts/seed.ts`

## C. Implemented features
- Auth: register/login/refresh/logout with JWT (iss/aud/nbf, JTI), refresh rotation/reuse detection, blacklist, password strength check, login rate-limit.
- Catalog: category/product CRUD (admin), product listing/search with pagination.
- Cart: get/add/update/remove/clear with stock checks.
- Orders: create from cart using Mongo transaction + stock reservation; list/get mine; admin list/update status.
- Payments: PayWay checkout + pushback verify via check-transaction; Stripe PaymentIntent + webhook verification; idempotency guard; webhook logging.
- Security middleware: helmet, rate-limit, CORS, requestId.
- Health endpoint checks Mongo/Redis; RS init script for Mongo.

## D. Missing features
- CI/CD pipeline, ESLint/Prettier.
- Integration tests for end-to-end flows.
- Expanded OpenAPI with schemas/errors/security.
- Metrics endpoint and configurable logging.
- Container hardening (multi-stage, non-root, prod install).
- Data validation (phone/country, slug uniqueness, deviceId middleware reuse).
- HIBP breach check option.
- Payment automated tests and idempotency TTL config.
- Security flows: email verification, password reset, TOTP, audit logging.
- Caching/index review; portfolio/demo polish.

## E. Bugs / code smells / security risks
- Error responses inconsistent; requestId not always present in body.
- Payment webhooks lack automated tests and configurable idempotency TTL.
- HIBP not implemented; password breach risk.
- Container runs as root, single-stage build.
- Missing CI gates; lint not enforced.
- Data validation gaps (phone, slug uniqueness).
- Webhook log retention unbounded.

## F. Missing tests
- Integration (auth→cart→order→payment, RBAC).
- Payment webhooks (Stripe, PayWay) with mocks.
- Auth refresh reuse/blacklist and weak/breached password cases.
- Validation/404 behavior for cart operations.

## G. Missing docs
- OpenAPI completeness (schemas, errors, security).
- README updates for new env vars (issuer/audience, webhook secrets), Mongo RS automation, run/test instructions.
- Ops/metrics/logging guidance.

## H. Deployment gaps
- No CI/CD workflow.
- Dockerfile not hardened; no non-root, no multi-stage, no prod install.
- Redis use not clearly decided/documented.
- Server healthcheck exists but metrics absent.

## I. Observability gaps
- No `/metrics`; log level not env-driven; rotation/transport unspecified.
- Error bodies missing requestId.

## J. Prioritized action plan (risk-first)
1. P0 Mongo RS reliability (already partially done) – validate and finalize.
2. P0 Global error handling & requestId standardization.
3. P0 Auth/token hardening (HIBP option, tests).
4. P0 Payment security (tests, idempotency TTL, validation).
5. P1 CI/CD with lint/test/build/docker; add ESLint/Prettier.
6. P1 Container hardening.
7. P1 Integration tests for core flows.
8. P1 404 correctness finalization (cart semantics).
9. P2 Observability/metrics + log level config.
10. P2 API documentation expansion.
11. P2 Data validation & integrity (phone, slug, deviceId).
12. P3 Security enhancements (email verify, reset, TOTP, audit).
13. P3 Performance & caching.
14. P4 Portfolio polish.

## K. Exact next 10 tasks
1) Standardize error responses with requestId; update tests/docs (P0).  
2) Confirm Mongo RS health flow end-to-end; document; small retry/backoff tuning if needed (P0).  
3) Add HIBP optional breach check flag and tests (P0).  
4) Add payment webhook/idempotency tests and TTL config (P0).  
5) Create CI workflow + ESLint/Prettier configs and scripts (P1).  
6) Harden Dockerfile (multi-stage, non-root, prod install) and adjust compose healthcheck (P1).  
7) Build integration test harness with mongodb-memory-server + supertest covering auth→cart→order→payment (P1).  
8) Finalize cart 404 semantics and tests (P1).  
9) Add `/metrics` endpoint and env-driven log level (P2).  
10) Expand OpenAPI via zod-to-openapi generation and publish in Swagger (P2).
