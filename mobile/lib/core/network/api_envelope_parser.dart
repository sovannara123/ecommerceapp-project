import 'package:dio/dio.dart';

import 'api_envelope.dart';

T parseApiEnvelopeData<T>({
  required Response<Map<String, dynamic>> response,
  required T Function(Object? data) fromData,
}) {
  final envelope = ApiEnvelope<T>.fromJson(
    response.data ?? <String, dynamic>{},
    fromData,
  );

  if (!envelope.success) {
    throw DioException(
      requestOptions: response.requestOptions,
      response: response,
      type: DioExceptionType.badResponse,
      error: envelope.message ?? 'Request failed',
    );
  }

  final data = envelope.data;
  if (data == null) {
    throw DioException(
      requestOptions: response.requestOptions,
      response: response,
      type: DioExceptionType.badResponse,
      error: 'Response payload is missing data',
    );
  }
  return data;
}
