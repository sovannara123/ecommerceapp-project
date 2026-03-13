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
        final isAndroid =
            !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
        return isAndroid
            ? 'http://10.0.2.2:3000/api'
            : 'http://localhost:3000/api';
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

  factory AppConfig.fromEnvironment() {
    final environment = AppConfig.environment;
    final apiBaseUrl = apiBaseUrlForEnvironment(environment).trim();

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
