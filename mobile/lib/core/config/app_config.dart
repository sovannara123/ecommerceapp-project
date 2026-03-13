import 'package:flutter/foundation.dart';

enum AppEnvironment { dev, staging, prod }

@immutable
class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
  });

  final String apiBaseUrl;

  static AppEnvironment get environment {
    const env = String.fromEnvironment('ENV', defaultValue: 'dev');
    return switch (env.toLowerCase().trim()) {
      'prod' => AppEnvironment.prod,
      'staging' => AppEnvironment.staging,
      _ => AppEnvironment.dev,
    };
  }

  static String apiBaseUrlForEnvironment(AppEnvironment environment) {
    switch (environment) {
      case AppEnvironment.dev:
        return 'https://ecommerceapp-project.onrender.com/api';
      case AppEnvironment.staging:
        return const String.fromEnvironment(
          'STAGING_API_URL',
          defaultValue: 'https://staging-api.northstar.com/api',
        );
      case AppEnvironment.prod:
        return const String.fromEnvironment(
          'API_URL',
          defaultValue: 'https://api.northstar.com/api',
        );
    }
  }

  static String _normalizeApiBaseUrl(String raw) {
    final trimmed = raw.trim();
    if (trimmed.isEmpty) return trimmed;

    final uri = Uri.tryParse(trimmed);
    if (uri == null) return trimmed;

    // Server routes are mounted under /api. If only host is provided, normalize
    // it to include /api to avoid silent endpoint mismatches.
    if (uri.path.isEmpty || uri.path == '/') {
      return uri.replace(path: '/api').toString();
    }

    return trimmed;
  }

  factory AppConfig.fromEnvironment() {
    final environment = AppConfig.environment;
    final apiBaseUrl =
        _normalizeApiBaseUrl(apiBaseUrlForEnvironment(environment));

    if (kReleaseMode) {
      if (apiBaseUrl.isEmpty) {
        throw StateError('Missing required API URL for release build.');
      }
      final lower = apiBaseUrl.toLowerCase();
      if (lower.contains('localhost') || lower.contains('127.0.0.1')) {
        throw StateError('Invalid API URL for release build: $apiBaseUrl');
      }
    }

    if (kReleaseMode) {
      final uri = Uri.parse(apiBaseUrl);
      if (uri.scheme != 'https') {
        throw StateError(
          'API base URL must use HTTPS in release mode. Got: $apiBaseUrl',
        );
      }
    }

    return AppConfig(
      apiBaseUrl: apiBaseUrl,
    );
  }
}
