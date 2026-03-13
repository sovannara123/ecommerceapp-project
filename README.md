# End-to-end eCommerce (Flutter + Express + MongoDB + ABA PayWay)

## 1) Run everything (recommended)
```bash
cp server/.env.example server/.env
docker compose up --build
```

MongoDB replica set initialization is automated in Docker so transactions work without a manual `rs.initiate`.

- Server: http://localhost:8080
- Swagger: http://localhost:8080/docs
- Admin: http://localhost:5173

## Staging Environment (production-like)

1. Bootstrap staging env file:
```bash
cp server/.env.staging.example server/.env.staging
```

2. Start isolated staging stack:
```bash
docker compose -f docker-compose.staging.yml up --build -d
```

3. Seed staging data:
```bash
docker compose -f docker-compose.staging.yml exec server-staging npm run seed
```

4. Run staging smoke test (auth/cart/checkout/payment intent):
```bash
bash scripts/staging-smoke.sh
```

Staging endpoints:
- API: http://localhost:8081
- Health: http://localhost:8081/health

Flutter staging run:
```bash
cd mobile
flutter run \
  --dart-define=ENV=staging \
  --dart-define=STAGING_API_URL=http://localhost:8081/api
```

Observability:
- Metrics endpoint: `GET /metrics` (Prometheus format)
- Set `LOG_LEVEL` in `server/.env` to control backend log verbosity
- `x-request-id` is returned in response headers and error responses
- Structured logs redact auth headers/cookies/webhook signatures and token-like fields

Cart behavior note:
- `GET /api/cart` lazily creates an empty cart for the authenticated user/device.
- `POST /api/cart/update`, `POST /api/cart/remove`, and `POST /api/cart/clear` return `404 CART_NOT_FOUND` if no cart exists for `(userId, deviceId)`.
- `POST /api/cart/remove` returns `404 ITEM_NOT_FOUND` when cart exists but product is not currently in cart.

## 2) Seed demo data
```bash
docker compose exec server npm run seed
```

Demo users:
- Admin: admin@example.com / Admin1234!
- Customer: user@example.com / User1234!

## 3) Mobile app
Open `/mobile` with Flutter and run:
```bash
flutter pub get
flutter run --dart-define=ENV=dev
```

> On physical device, replace localhost with your machine IP.

## 4) PayWay
This project implements PayWay purchase + check-transaction flow.
Pushback webhook verifies payment by calling check-transaction before marking orders as paid.

Set these in `server/.env`:
- PAYWAY_MERCHANT_ID
- PAYWAY_PUBLIC_KEY
- PAYWAY_BASE_URL (sandbox or production)
- PAYWAY_WEBHOOK_SECRET
- PAYWAY_MERCHANT_REFERER
- PAYWAY_CUSTOMER_EMAIL_FALLBACK (optional fallback when order user email is unavailable)
- STRIPE_WEBHOOK_IDEMPOTENCY_TTL_SEC
- PAYMENT_WEBHOOK_LOG_RETENTION_DAYS
- REDIS_CONNECT_MAX_RETRIES
- REDIS_CONNECT_RETRY_DELAY_MS

Optional auth hardening:
- HIBP_PASSWORD_CHECK_ENABLED=true
- HIBP_PASSWORD_CHECK_STRICT=false

Redis dependency behavior:
- Auth state checks fail closed with `503 AUTH_STATE_UNAVAILABLE` if Redis is unavailable.
- Payment webhook idempotency fails closed with `503 IDEMPOTENCY_STORE_UNAVAILABLE` if Redis is unavailable.

Next steps: configure the PayWay pushback URL to:
`http(s)://<your-domain>/api/payments/payway/pushback`


```bash
chmod +x e2e.sh
./e2e.sh
```

## Pre-commit Setup

```bash
# Install pre-commit
pip install pre-commit  # or brew install pre-commit

# Install hooks
pre-commit install

# Run on all files (first time)
pre-commit run --all-files
```
a3f60d8ef06025e26c905f6c6acd3415
