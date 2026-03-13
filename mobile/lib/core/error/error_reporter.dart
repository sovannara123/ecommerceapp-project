import 'package:sentry_flutter/sentry_flutter.dart';

import '../config/app_config.dart';
import '../errors/app_failure.dart';

class ErrorReporter {
  static Future<void> init(String dsn) async {
    await SentryFlutter.init((options) {
      options.dsn = dsn;
      options.tracesSampleRate = 0.2;
      options.environment = AppConfig.environment.name;
    });
  }

  static void reportError(
    dynamic error, {
    StackTrace? stackTrace,
    Map<String, dynamic>? extras,
  }) {
    Sentry.captureException(
      error,
      stackTrace: stackTrace,
      withScope: (scope) {
        scope.setContexts(
          'error_details',
          extras ?? <String, dynamic>{},
        );
      },
    );
  }

  static void reportApiError(AppFailure failure) {
    Sentry.captureException(
      Exception('API Error: ${failure.code}'),
      withScope: (scope) {
        scope.setTag('error.type', failure.type.name);
        scope.setTag('error.code', failure.code ?? 'UNKNOWN');
        scope.setContexts('error_report', {
          'statusCode': failure.statusCode,
          'requestId': failure.requestId,
          'message': failure.message,
        });
      },
    );
  }
}
