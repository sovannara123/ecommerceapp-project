class AppConstants {
  AppConstants._();

  static const appName = 'Northstar Commerce';
  static const secureAccessTokenKey = 'auth.access_token';
  static const secureRefreshTokenKey = 'auth.refresh_token';
  static const secureUserIdKey = 'auth.user_id';
  static const secureRememberedEmailKey = 'auth.remembered_email';
  static const legacyAccessTokenKey = 'accessToken';
  static const legacyRefreshTokenKey = 'refreshToken';
  static const legacyAuthUserJsonKey = 'authUserJson';
  static const prefsDeviceIdKey = 'device.id';

  // Render cold starts and mobile network handshakes can exceed 30s.
  static const connectTimeoutMs = 60000;
  static const receiveTimeoutMs = 60000;
}
