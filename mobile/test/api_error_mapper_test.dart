import 'package:dio/dio.dart';
import 'package:ecommerce_mobile/core/errors/app_failure.dart';
import 'package:ecommerce_mobile/core/network/api_error_mapper.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const mapper = ApiErrorMapper();

  test('maps backend error object into validation failure', () {
    final error = DioException(
      requestOptions: RequestOptions(path: '/auth/login'),
      response: Response(
        requestOptions: RequestOptions(path: '/auth/login'),
        statusCode: 400,
        data: {
          'error': {'code': 'VALIDATION_ERROR', 'message': 'Invalid email'},
          'requestId': 'req-1',
        },
      ),
      type: DioExceptionType.badResponse,
    );

    final failure = mapper.map(error);

    expect(failure.type, AppFailureType.validationError);
    expect(failure.code, 'VALIDATION_ERROR');
    expect(failure.message, 'Invalid email');
    expect(failure.requestId, 'req-1');
  });
}
