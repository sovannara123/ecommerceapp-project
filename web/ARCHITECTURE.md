# Frontend Architecture (V1)

## Why this structure
- `src/app`: route orchestration only (App Router pages/layout/loading/error/not-found).
- `src/features`: user-facing use cases (auth, catalog, cart, checkout, orders).
- `src/entities`: pure domain contracts (auth/product/cart/order/payment types).
- `src/shared`: cross-cutting foundation (API client, providers, UI primitives, config, utilities).
- `src/tests`: focused frontend behavior tests.

## Folder structure
- `src/app`
- `src/features`
- `src/entities`
- `src/shared`
  - `api`
  - `providers`
  - `ui`
  - `config`
  - `lib`
  - `types`
- `src/styles`
- `src/tests`

## Integration strategy
- All backend calls go through `src/shared/api/*` modules.
- Axios client centralizes base URL, auth headers, device-id, refresh retry.
- Errors are normalized in one place (`normalizeApiError`).
- Backend envelope is treated as source of truth.

## Auth/session strategy
- Backend token strategy is preserved.
- Session is stored in Zustand persist store (localStorage) to align with bearer-token API contract.
- Automatic refresh on qualifying 401 UNAUTHORIZED responses.
- Refresh failure (`INVALID_REFRESH` / `SESSION_NOT_FOUND` / `REFRESH_REUSED`) clears session.

## Route protection
- Client-side `AuthGuard` wraps protected pages (`/cart`, `/checkout`, `/orders/...`).

## UI system
- Reusable primitives in `shared/ui`.
- Feature modules compose primitives, not ad-hoc custom widgets per page.

## Production hardening included
- App-level loading/error/not-found files.
- Request-id exposure through normalized error + dev logging.
- Mobile navigation, responsive commerce cards, clear empty states.
- SEO metadata for product detail pages.

## Test strategy
- API error normalization test.
- Auth form behavior test.
- Cart interaction test.
- Route guard test.
