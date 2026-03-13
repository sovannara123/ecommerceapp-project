# Server (Express + MongoDB + ABA PayWay)

## Run (Docker)
From repo root:
```bash
cp server/.env.example server/.env
docker compose up --build
```

MongoDB replica set initialization is automated in Docker so transactions work without a manual `rs.initiate`.

Server: http://localhost:8080  
Swagger UI: http://localhost:8080/docs

## Staging (Docker)
From repo root:
```bash
cp server/.env.staging.example server/.env.staging
docker compose -f docker-compose.staging.yml up --build -d
```

Staging server:
- API: http://localhost:8081
- Swagger: http://localhost:8081/docs

Run staging smoke test:
```bash
bash scripts/staging-smoke.sh
```

Seed staging data:
```bash
docker compose -f docker-compose.staging.yml exec server-staging npm run seed
```

## Observability
- `GET /metrics` exposes Prometheus metrics.
- Set `LOG_LEVEL` (`trace|debug|info|warn|error|fatal|silent`) to control pino log verbosity.
- `x-request-id` is echoed on responses and included in structured request/error logs.
- Sensitive headers and token-like fields are redacted in structured logs.

## Cart semantics
- `GET /api/cart` lazily creates an empty cart per `(userId, deviceId)` when missing.
- `POST /api/cart/update`, `POST /api/cart/remove`, and `POST /api/cart/clear` return `404 CART_NOT_FOUND` when no cart exists for `(userId, deviceId)`.
- `POST /api/cart/remove` returns `404 ITEM_NOT_FOUND` when cart exists but product is not in cart.

## Seed data
```bash
docker compose exec server npm run seed
```

Seed users:
- admin@example.com / Admin1234!
- user@example.com / User1234!

## PayWay integration notes
- Purchase hash sequence and Check Transaction hash follow PayWay v2 PDF guidelines.
- Pushback webhook does not include a signature in the example response, so the server **verifies payment by calling Check Transaction** before marking the order as paid.
- PayWay purchase `Referer` header is configurable via `PAYWAY_MERCHANT_REFERER`.
- Customer email for PayWay payload is resolved from order user; fallback uses `PAYWAY_CUSTOMER_EMAIL_FALLBACK` when needed.

Configure in `server/.env`:
- PAYWAY_* variables
- `PAYWAY_WEBHOOK_SECRET`
- `STRIPE_WEBHOOK_IDEMPOTENCY_TTL_SEC`
- `PAYMENT_WEBHOOK_LOG_RETENTION_DAYS`
- `REDIS_CONNECT_MAX_RETRIES`
- `REDIS_CONNECT_RETRY_DELAY_MS`

Optional auth hardening:
- `HIBP_PASSWORD_CHECK_ENABLED=true`
- `HIBP_PASSWORD_CHECK_STRICT=false`

## Redis dependency behavior
- Auth token blacklist checks fail closed: API returns `503 AUTH_STATE_UNAVAILABLE` when Redis state storage is unavailable.
- Payment webhook idempotency fails closed: API returns `503 IDEMPOTENCY_STORE_UNAVAILABLE` when Redis idempotency storage is unavailable.
