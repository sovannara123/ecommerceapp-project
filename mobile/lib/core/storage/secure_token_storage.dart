import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../constants/app_constants.dart';

class SecureTokenStorage {
  const SecureTokenStorage(this._storage);

  final FlutterSecureStorage _storage;

  Future<String?> readAccessToken() async {
    final token = await _storage.read(key: AppConstants.secureAccessTokenKey);
    if (token != null && token.isNotEmpty) {
      return token;
    }

    // Migration path from legacy keys used by the previous auth stack.
    final legacy = await _storage.read(key: AppConstants.legacyAccessTokenKey);
    if (legacy != null && legacy.isNotEmpty) {
      await _storage.write(key: AppConstants.secureAccessTokenKey, value: legacy);
      await _storage.delete(key: AppConstants.legacyAccessTokenKey);
    }
    return legacy;
  }

  Future<String?> readRefreshToken() async {
    final token = await _storage.read(key: AppConstants.secureRefreshTokenKey);
    if (token != null && token.isNotEmpty) {
      return token;
    }

    // Migration path from legacy keys used by the previous auth stack.
    final legacy = await _storage.read(key: AppConstants.legacyRefreshTokenKey);
    if (legacy != null && legacy.isNotEmpty) {
      await _storage.write(key: AppConstants.secureRefreshTokenKey, value: legacy);
      await _storage.delete(key: AppConstants.legacyRefreshTokenKey);
    }
    return legacy;
  }

  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await Future.wait([
      _storage.write(key: AppConstants.secureAccessTokenKey, value: accessToken),
      _storage.write(key: AppConstants.secureRefreshTokenKey, value: refreshToken),
    ]);
  }

  Future<void> clear() async {
    await Future.wait([
      _storage.delete(key: AppConstants.secureAccessTokenKey),
      _storage.delete(key: AppConstants.secureRefreshTokenKey),
      _storage.delete(key: AppConstants.secureUserIdKey),
      _storage.delete(key: AppConstants.legacyAccessTokenKey),
      _storage.delete(key: AppConstants.legacyRefreshTokenKey),
      _storage.delete(key: AppConstants.legacyAuthUserJsonKey),
    ]);
  }
}
