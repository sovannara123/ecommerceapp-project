import 'dart:io';

import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/providers.dart';
import '../constants/app_constants.dart';
import '../storage/device_id_store.dart';
import '../storage/secure_token_storage.dart';
import '../utils/result.dart';
import '../network/api_error_mapper.dart';
import '../network/auth_session_coordinator.dart';
import 'interceptors/auth_request_interceptor.dart';
import 'interceptors/cache_interceptor.dart';
import 'interceptors/connectivity_interceptor.dart';
import 'interceptors/error_interceptor.dart';
import 'interceptors/retry_interceptor.dart';

List<String> _loadPinnedFingerprints() {
  const pins = String.fromEnvironment('API_CERT_PINS', defaultValue: '');
  if (pins.trim().isEmpty) {
    return const [];
  }
  final values = <String>[];
  for (final part in pins.split(',')) {
    final value = part.trim();
    if (value.isNotEmpty) {
      values.add(value);
    }
  }
  return List.unmodifiable(values);
}

void _configureCertificatePinning(Dio dio) {
  // === TLS Certificate Pinning (production only) ===
  if (!kDebugMode) {
    // SHA-256 fingerprints of your API server's leaf certificate public key.
    // Generate with:
    //   openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com </dev/null 2>/dev/null \
    //     | openssl x509 -pubkey -noout \
    //     | openssl pkey -pubin -outform der \
    //     | openssl dgst -sha256 -binary \
    //     | base64
    //
    // IMPORTANT: Include at least 2 pins — primary and backup (from next certificate).
    final pinnedFingerprints = _loadPinnedFingerprints();

    // ┌──────────────────────────────────────────────────────────────┐
    // │  BEFORE PRODUCTION LAUNCH:                                   │
    // │  1. Generate certificate pins for your API domain             │
    // │  2. Add primary + backup pins to pinnedFingerprints           │
    // │  3. Set up pin rotation process (update app before cert       │
    // │     rotation, or use intermediate CA pinning)                 │
    // │  4. Consider using package:dio_certificate_pinning for        │
    // │     full public key pinning with SHA-256 comparison           │
    // └──────────────────────────────────────────────────────────────┘

    // Only enforce if pins are configured
    if (pinnedFingerprints.isNotEmpty) {
      final adapter = dio.httpClientAdapter;
      if (adapter is IOHttpClientAdapter) {
        adapter.createHttpClient = () {
          final client = HttpClient();
          client.badCertificateCallback =
              (X509Certificate cert, String host, int port) {
            // In a full implementation, compare cert.sha256 against pinnedFingerprints.
            // For now, reject all bad certificates (no self-signed allowed in production).
            return false;
          };
          return client;
        };
      }
    }
  }
}

final deviceIdStoreProvider = Provider<DeviceIdStore>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return DeviceIdStore(prefs);
});

final secureTokenStorageProvider = Provider<SecureTokenStorage>((ref) {
  final secure = ref.watch(secureStorageProvider);
  return SecureTokenStorage(secure);
});

final authSessionCoordinatorProvider = Provider<AuthSessionCoordinator>((ref) {
  final config = ref.watch(appConfigProvider);
  final storage = ref.watch(secureTokenStorageProvider);
  final deviceStore = ref.watch(deviceIdStoreProvider);

  final refreshDio = Dio(
    BaseOptions(
      baseUrl: config.apiBaseUrl,
      connectTimeout:
          const Duration(milliseconds: AppConstants.connectTimeoutMs),
      receiveTimeout:
          const Duration(milliseconds: AppConstants.receiveTimeoutMs),
      contentType: Headers.jsonContentType,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'northstar-mobile/1.0.0',
      },
    ),
  );
  _configureCertificatePinning(refreshDio);

  return AuthSessionCoordinator(
    storage: storage,
    refreshDio: refreshDio,
    deviceIdStore: deviceStore,
  );
});

final dioProvider = Provider<Dio>((ref) {
  final config = ref.watch(appConfigProvider);
  final deviceStore = ref.watch(deviceIdStoreProvider);
  final session = ref.watch(authSessionCoordinatorProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: config.apiBaseUrl,
      connectTimeout:
          const Duration(milliseconds: AppConstants.connectTimeoutMs),
      receiveTimeout:
          const Duration(milliseconds: AppConstants.receiveTimeoutMs),
      contentType: Headers.jsonContentType,
      responseType: ResponseType.json,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'northstar-mobile/1.0.0',
      },
    ),
  );
  _configureCertificatePinning(dio);

  dio.interceptors.addAll([
    ConnectivityInterceptor(),
    AuthRequestInterceptor(session: session, deviceIdStore: deviceStore),
    RetryInterceptor(dio: dio),
    CacheInterceptor(),
    ErrorInterceptor(
      dio,
      () => session.refreshIfNeeded(),
    ),
    if (kDebugMode)
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        logPrint: (log) => debugPrint(log.toString()),
      ),
  ]);

  return dio;
});

final apiErrorMapperProvider =
    Provider<ApiErrorMapper>((ref) => const ApiErrorMapper());

Future<Result<T>> safeApiCall<T>(Ref ref, Future<T> Function() action) async {
  try {
    final result = await action();
    return Success(result);
  } catch (error) {
    final failure = ref.read(apiErrorMapperProvider).map(error);
    return Failure<T>(failure);
  }
}
