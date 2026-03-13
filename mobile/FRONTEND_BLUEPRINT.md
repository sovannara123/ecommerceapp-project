# Flutter Frontend Blueprint (Phase 1-2)

This document defines the production architecture baseline for the Flutter ecommerce app and the backend integration strategy.

## 1) Architecture Blueprint

The app uses **feature-first + layered modules**:

- `app/`: bootstrap, shell, routing, guarded navigation.
- `core/`: cross-cutting concerns (network, storage, errors, theme, shared widgets).
- `features/*`: feature modules with `data/domain/presentation` boundaries.

Why this structure:

- Prevents API and state logic from leaking into UI widgets.
- Keeps features independently testable and team-scalable.
- Supports adding coupons, wishlist, inventory, and admin modules without cross-feature coupling.

## 2) Folder Structure (Current)

```txt
lib/
  app/
    app.dart
    router/
      app_router.dart
  core/
    constants/
      app_constants.dart
    config/
      app_config.dart
      providers.dart
    errors/
      app_failure.dart
    network/
      api_envelope.dart
      api_error_mapper.dart
      auth_session_coordinator.dart
      dio_provider.dart
      interceptors/
        auth_request_interceptor.dart
        refresh_token_interceptor.dart
    storage/
      secure_token_storage.dart
      device_id_store.dart
    theme/
      app_theme.dart
    utils/
      result.dart
    widgets/
      app_async_view.dart
  features/
    auth/
      data/
        datasources/auth_remote_data_source.dart
        models/auth_models.dart
        repositories/auth_repository_impl.dart
      domain/
        entities/auth_session.dart
        repositories/auth_repository.dart
      presentation/
        controllers/auth_session_controller.dart
        pages/login_page.dart
    products/
      presentation/pages/home_page.dart
    profile/
      presentation/pages/profile_page.dart
main.dart
```

Legacy folders are still present and intentionally not removed yet to avoid high-risk migration churn.

## 3) Dependency Baseline (pubspec)

Core stack in use:

- `flutter_riverpod`: dependency graph + state ownership.
- `go_router`: route guards and navigation.
- `dio`: HTTP client + interceptors.
- `freezed` + `json_serializable`: typed DTOs/envelopes.
- `flutter_secure_storage`: access/refresh token storage.
- `shared_preferences`: non-sensitive persistent state (device id, ui prefs).
- `uuid`: deterministic device id generation.

## 4) App Bootstrap Strategy

`main.dart` bootstraps immutable runtime dependencies and injects them through `ProviderScope` overrides:

- `AppConfig` (`API_BASE_URL` via `--dart-define`)
- `SharedPreferences`
- `FlutterSecureStorage`

This keeps runtime environment concerns out of widgets and features.

## 5) Network + Auth Foundation

### Request pipeline

- `AuthRequestInterceptor`
  - injects `x-device-id`
  - injects bearer access token when available
- `RefreshTokenInterceptor`
  - on 401, performs single refresh flow and retries request once
  - blocks refresh loops using `requestOptions.extra['auth_retry']`
  - skips refresh for auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`)

### Session coordination

`AuthSessionCoordinator` is the single source of truth for auth tokens:

- hydrates from secure storage at startup
- updates and persists tokens after login/refresh
- expires session fail-closed on refresh errors
- supports one refresh at a time to avoid request stampede/race conditions

### Error mapping

`ApiErrorMapper` converts Dio failures into typed `AppFailure`:

- `networkError`, `timeout`, `unauthorized`, `forbidden`,
  `validationError`, `notFound`, `serverError`, `unknown`

### Backend contract adapter points

If your backend response differs, update only these files:

- auth envelope parsing: `lib/features/auth/data/datasources/auth_remote_data_source.dart`
- refresh payload mapping: `lib/core/network/auth_session_coordinator.dart`
- global error payload mapping: `lib/core/network/api_error_mapper.dart`
- base URL/config: `lib/core/config/app_config.dart`

This isolates contract drift to adapter boundaries, not UI code.
