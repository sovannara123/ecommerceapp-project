# Northstar Commerce Mobile

Flutter mobile app for ecommerce built on `lib/app + lib/core + lib/features`.

## Environment Configuration

Set environment with `--dart-define`:

```bash
flutter run --dart-define=ENV=staging --dart-define=STAGING_API_URL=https://api-staging.example.com/api
```

Release builds reject localhost and non-HTTPS API URLs at runtime.

## Android Release Signing

Bootstrap signing config:

```bash
cp android/key.properties.example android/key.properties
```

Then update `android/key.properties` (do not commit):

```properties
storeFile=../keystore/release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=YOUR_KEY_ALIAS
keyPassword=YOUR_KEY_PASSWORD
```

Release builds fail fast if signing is missing.

## Build Commands

Debug:

```bash
flutter run --dart-define=ENV=dev
```

Staging (local Docker staging backend):
```bash
flutter run --dart-define=ENV=staging --dart-define=STAGING_API_URL=http://localhost:8081/api
```

Android release:

```bash
flutter build appbundle --release --dart-define=ENV=prod --dart-define=API_URL=https://api.example.com/api
```

iOS release:

```bash
flutter build ios --release --dart-define=ENV=prod --dart-define=API_URL=https://api.example.com/api
```

## iOS Provisioning Setup

`flutter build ios` requires valid Apple signing/provisioning in Xcode.

1. Open `ios/Runner.xcworkspace` in Xcode.
2. Select the `Runner` target -> `Signing & Capabilities`.
3. Choose your Apple Team.
4. Keep signing style as `Automatic` unless you manage manual profiles.
5. Ensure the bundle identifier is unique for your org:
   `com.northstar.ecommercemobile`.
6. Build once in Xcode to allow profile generation.

CI recommendation:
- Build with `--no-codesign` for compile checks.
- Use dedicated signing credentials only in release pipelines.

## Validation Gates

Before merging:

```bash
flutter analyze
flutter test
```

Before release:
1. Validate login, refresh, logout.
2. Validate products -> cart -> checkout -> order detail flow.
3. Validate payment handoff and order status refresh.
4. Validate no localhost API URL in release.
