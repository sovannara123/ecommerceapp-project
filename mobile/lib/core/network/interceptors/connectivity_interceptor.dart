import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';

/// Ensures requests are only sent when the device has network connectivity.
class ConnectivityInterceptor extends Interceptor {
  /// Creates a connectivity guard interceptor.
  ConnectivityInterceptor();

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final result = await Connectivity().checkConnectivity();
    final isOffline = _isOfflineResult(result);

    if (isOffline) {
      handler.reject(
        DioException(
          type: DioExceptionType.connectionError,
          requestOptions: options,
          error: 'No internet connection',
        ),
      );
      return;
    }

    handler.next(options);
  }

  bool _isOfflineResult(dynamic result) {
    if (result is List<ConnectivityResult>) {
      return result.isEmpty ||
          result.every((value) => value == ConnectivityResult.none);
    }
    if (result is ConnectivityResult) {
      return result == ConnectivityResult.none;
    }
    return false;
  }
}
