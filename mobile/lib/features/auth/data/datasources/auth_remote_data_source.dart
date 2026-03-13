import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope.dart';
import '../models/auth_models.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource(this._dio);

  final Dio _dio;

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim().toLowerCase();
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/register',
      data: {
        'name': name,
        'email': normalizedEmail,
        'password': password,
      },
    );

    final envelope = ApiEnvelope<Map<String, dynamic>>.fromJson(
      response.data ?? <String, dynamic>{},
      (json) => (json as Map).cast<String, dynamic>(),
    );

    if (!envelope.success) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        error: envelope.message ?? 'Registration failed',
      );
    }
  }

  Future<LoginResponseDto> login({
    required String email,
    required String password,
  }) async {
    final normalizedEmail = email.trim().toLowerCase();
    final response = await _dio.post<Map<String, dynamic>>(
      '/auth/login',
      data: {
        'email': normalizedEmail,
        'password': password,
      },
      options: Options(
        extra: {
          // Safe to retry transport-level failures for login.
          'retryable': true,
        },
      ),
    );

    final envelope = ApiEnvelope<Map<String, dynamic>>.fromJson(
      response.data ?? <String, dynamic>{},
      (json) => (json as Map).cast<String, dynamic>(),
    );

    if (!envelope.success || envelope.data == null) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        error: envelope.message ?? 'Login failed',
      );
    }

    return LoginResponseDto.fromJson(envelope.data!);
  }

  Future<void> logout() async {
    final response = await _dio.post<Map<String, dynamic>>('/auth/logout');
    final envelope = ApiEnvelope<bool>.fromJson(
      response.data ?? <String, dynamic>{},
      (json) => json as bool,
    );
    if (!envelope.success) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        error: envelope.message ?? 'Logout failed',
      );
    }
  }
}
