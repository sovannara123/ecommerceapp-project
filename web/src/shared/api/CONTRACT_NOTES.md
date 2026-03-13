# Backend Contract Notes

These frontend API modules are mapped directly from `server/src/routes` and controller/validator behavior.

## Confirmed contracts
- Base API prefix: `/api`
- Standard success envelope: `{ success: true, data: ... }`
- Standard error envelope: `{ success: false, error, message, requestId, details? }`
- Auth requires `x-device-id` for login/refresh/logout and cart/order operations.
- Access token is required in `Authorization: Bearer <token>` for protected routes.
- Refresh endpoint returns tokens without user profile (`accessToken`, `refreshToken`, `expiresAt`).

## Isolated assumptions (explicit)
- PayWay flow for web currently redirects to `deeplink` when present; `checkoutHtml` rendering is not yet implemented as embedded HTML page.
- Stripe create-intent returns `clientSecret`; frontend stores and passes it to confirmation route for next-step payment UI.

## TODOs
- Add dedicated payment status polling UI if backend exposes a read endpoint for payment state transitions.
- Add category/filter UX enhancements once category-backed navigation requirements are finalized.
