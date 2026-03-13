import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:ecommerce_mobile/core/network/auth_session_coordinator.dart';
import 'package:ecommerce_mobile/core/storage/device_id_store.dart';
import 'package:ecommerce_mobile/core/storage/secure_token_storage.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

class _InMemorySecureTokenStorage extends SecureTokenStorage {
  _InMemorySecureTokenStorage({
    this.accessToken,
    this.refreshToken,
  }) : super(const FlutterSecureStorage());

  String? accessToken;
  String? refreshToken;

  @override
  Future<String?> readAccessToken() async => accessToken;

  @override
  Future<String?> readRefreshToken() async => refreshToken;

  @override
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  @override
  Future<void> clear() async {
    accessToken = null;
    refreshToken = null;
  }
}

class _DelayedRefreshAdapter implements HttpClientAdapter {
  _DelayedRefreshAdapter();

  @override
  void close({bool force = false}) {}

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    await Future<void>.delayed(const Duration(milliseconds: 60));
    return ResponseBody.fromString(
      jsonEncode({
        'success': true,
        'data': {
          'accessToken': 'new-access',
          'refreshToken': 'new-refresh',
        },
      }),
      200,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }
}

void main() {
  test('clear during in-flight refresh does not restore stale tokens', () async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    final tokenStorage = _InMemorySecureTokenStorage(
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
    );

    final refreshDio = Dio(BaseOptions(baseUrl: 'http://localhost:8080/api'));
    refreshDio.httpClientAdapter = _DelayedRefreshAdapter();

    final coordinator = AuthSessionCoordinator(
      storage: tokenStorage,
      refreshDio: refreshDio,
      deviceIdStore: DeviceIdStore(prefs),
    );

    await coordinator.hydrate();
    final refreshFuture = coordinator.refreshIfNeeded();

    await Future<void>.delayed(const Duration(milliseconds: 10));
    await coordinator.clear();

    final refreshedToken = await refreshFuture;
    expect(refreshedToken, isNull);
    expect(coordinator.accessToken, isNull);
    expect(coordinator.refreshToken, isNull);

    // Ensure late refresh response cannot repopulate tokens.
    await Future<void>.delayed(const Duration(milliseconds: 80));
    expect(coordinator.accessToken, isNull);
    expect(coordinator.refreshToken, isNull);
    expect(tokenStorage.accessToken, isNull);
    expect(tokenStorage.refreshToken, isNull);
  });
}
