import 'dart:async';

import 'package:dio/dio.dart';

import '../storage/device_id_store.dart';
import '../storage/secure_token_storage.dart';

typedef SessionExpiredCallback = FutureOr<void> Function();

class AuthSessionCoordinator {
  AuthSessionCoordinator({
    required this.storage,
    required this.refreshDio,
    required this.deviceIdStore,
  });

  final SecureTokenStorage storage;
  final Dio refreshDio;
  final DeviceIdStore deviceIdStore;
  SessionExpiredCallback? onSessionExpired;

  String? _accessToken;
  String? _refreshToken;
  Completer<String?>? _refreshCompleter;
  int _tokenRevision = 0;

  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get isAuthenticated => _accessToken != null && _refreshToken != null;

  Future<void> hydrate() async {
    _accessToken = await storage.readAccessToken();
    _refreshToken = await storage.readRefreshToken();
  }

  Future<void> setTokens({required String accessToken, required String refreshToken}) async {
    _tokenRevision++;
    _accessToken = accessToken;
    _refreshToken = refreshToken;
    await storage.saveTokens(accessToken: accessToken, refreshToken: refreshToken);
  }

  Future<void> clear() async {
    _tokenRevision++;
    _accessToken = null;
    _refreshToken = null;
    final active = _refreshCompleter;
    _refreshCompleter = null;
    if (active != null && !active.isCompleted) {
      active.complete(null);
    }
    await storage.clear();
  }

  bool shouldSkipRefreshForPath(String path) {
    return path.contains('/auth/login') ||
        path.contains('/auth/register') ||
        path.contains('/auth/refresh') ||
        path.contains('/auth/logout');
  }

  Future<String?> refreshIfNeeded() async {
    if (_refreshToken == null) {
      await _expireSession();
      return null;
    }

    final active = _refreshCompleter;
    if (active != null) return active.future;

    final completer = Completer<String?>();
    _refreshCompleter = completer;
    final startedWithRevision = _tokenRevision;
    final startedWithRefreshToken = _refreshToken;

    try {
      final deviceId = await deviceIdStore.getOrCreate();
      final response = await refreshDio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': _refreshToken},
        options: Options(
          headers: {'x-device-id': deviceId},
        ),
      );

      final envelope = response.data ?? <String, dynamic>{};
      if (envelope['success'] != true) {
        if (_sameSnapshot(startedWithRevision, startedWithRefreshToken)) {
          await _expireSession();
        }
        _completeIfPending(completer, null);
        return null;
      }

      final data = envelope['data'] as Map<String, dynamic>?;
      final nextAccessToken = data?['accessToken'] as String?;
      final nextRefreshToken = data?['refreshToken'] as String?;
      if (nextAccessToken == null || nextRefreshToken == null) {
        if (_sameSnapshot(startedWithRevision, startedWithRefreshToken)) {
          await _expireSession();
        }
        _completeIfPending(completer, null);
        return null;
      }

      if (!_sameSnapshot(startedWithRevision, startedWithRefreshToken)) {
        _completeIfPending(completer, null);
        return null;
      }

      await setTokens(accessToken: nextAccessToken, refreshToken: nextRefreshToken);
      _completeIfPending(completer, nextAccessToken);
      return nextAccessToken;
    } catch (_) {
      if (_sameSnapshot(startedWithRevision, startedWithRefreshToken)) {
        await _expireSession();
      }
      _completeIfPending(completer, null);
      return null;
    } finally {
      _refreshCompleter = null;
    }
  }

  bool _sameSnapshot(int revision, String? refreshToken) {
    return _tokenRevision == revision && _refreshToken == refreshToken;
  }

  void _completeIfPending(Completer<String?> completer, String? value) {
    if (!completer.isCompleted) {
      completer.complete(value);
    }
  }

  Future<void> _expireSession() async {
    await clear();
    await onSessionExpired?.call();
  }
}
