import 'package:dio/dio.dart';

/// Retries transiently failed safe requests with exponential backoff.
///
/// This interceptor retries only idempotent HTTP methods (`GET`, `HEAD`) and
/// only for timeout/connection failures or server-side (5xx) responses.
class RetryInterceptor extends Interceptor {
  /// Creates a retry interceptor bound to [dio].
  ///
  /// [maxRetries] controls the maximum number of retry attempts after the
  /// initial request. [baseDelay] is multiplied by `2^retryCount` before each
  /// retry.
  RetryInterceptor({
    required this.dio,
    this.maxRetries = 2,
    this.baseDelay = const Duration(milliseconds: 300),
  });

  @Deprecated(
      'Use named constructor params: RetryInterceptor(dio: ...) instead.')
  RetryInterceptor.legacy(
    this.dio, {
    this.maxRetries = 2,
    this.baseDelay = const Duration(milliseconds: 300),
  });

  /// The dio client used to replay failed requests.
  final Dio dio;

  /// Maximum retry attempts for a request.
  final int maxRetries;

  /// Base delay used for exponential backoff between retries.
  final Duration baseDelay;

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    final requestOptions = err.requestOptions;
    final retryCount = _readRetryCount(requestOptions);

    if (!_isRetryableMethod(requestOptions.method) ||
        !_isRetryableError(err) ||
        retryCount >= maxRetries) {
      handler.next(err);
      return;
    }

    final delayMultiplier = 1 << retryCount;
    final delay =
        Duration(milliseconds: baseDelay.inMilliseconds * delayMultiplier);
    await Future<void>.delayed(delay);

    requestOptions.extra['retryCount'] = retryCount + 1;

    try {
      final response = await dio.fetch<dynamic>(requestOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.next(retryError);
    }
  }

  bool _isRetryableMethod(String method) {
    final normalized = method.toUpperCase();
    return normalized == 'GET' || normalized == 'HEAD';
  }

  bool _isRetryableError(DioException err) {
    final statusCode = err.response?.statusCode;
    if (statusCode != null) {
      if (statusCode >= 400 && statusCode < 500) {
        return false;
      }
      if (statusCode >= 500) {
        return true;
      }
    }

    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError;
  }

  int _readRetryCount(RequestOptions requestOptions) {
    final value = requestOptions.extra['retryCount'];
    if (value is int) {
      return value;
    }
    if (value is String) {
      return int.tryParse(value) ?? 0;
    }
    return 0;
  }
}
