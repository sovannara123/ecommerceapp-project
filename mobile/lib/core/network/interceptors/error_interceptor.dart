import 'package:dio/dio.dart';

/// Handles API errors and attempts token refresh + request replay on 401.
///
/// This interceptor replaces the old inline refresh-token interceptor wiring
/// by centralizing the 401 refresh-and-retry behavior in one place.
class ErrorInterceptor extends Interceptor {
  ErrorInterceptor(
    this.dio,
    this.refreshToken,
  );

  final Dio dio;
  final Future<String?> Function() refreshToken;

  @override
  Future<void> onError(
      DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final token = await refreshToken();
      if (token != null && token.isNotEmpty) {
        final options = err.requestOptions;
        final headers = Map<String, dynamic>.from(options.headers);
        headers['Authorization'] = 'Bearer $token';

        final clonedOptions = options.copyWith(headers: headers);
        try {
          final response = await dio.fetch<dynamic>(clonedOptions);
          handler.resolve(response);
          return;
        } on DioException catch (retryError) {
          handler.next(retryError);
          return;
        }
      }
      handler.next(err);
      return;
    }

    handler.next(err);
  }
}
