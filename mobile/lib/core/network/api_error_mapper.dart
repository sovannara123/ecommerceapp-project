import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../error/error_reporter.dart';
import '../errors/app_failure.dart';

class ApiErrorMapper {
  const ApiErrorMapper();

  AppFailure map(Object error) {
    if (error is DioException) {
      final status = error.response?.statusCode;
      final data = error.response?.data;
      final mapData = data is Map<String, dynamic> ? data : <String, dynamic>{};
      final rawError = mapData['error'];
      final errorMap = rawError is Map<String, dynamic> ? rawError : null;
      final code = (mapData['code'] as String?) ??
          (errorMap?['code'] as String?) ??
          (rawError is String ? rawError : null);
      final message = (mapData['message'] as String?) ??
          (errorMap?['message'] as String?) ??
          error.message ??
          'Request failed';
      final requestId = (mapData['requestId'] as String?) ??
          error.response?.headers.value('x-request-id');
      final details = mapData['details'] ?? errorMap?['details'];

      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.sendTimeout ||
          error.type == DioExceptionType.receiveTimeout) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.timeout,
            message:
                'Connection timed out. If the server is waking up, please try again in a moment.',
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }

      if (error.type == DioExceptionType.connectionError) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.networkError,
            message: 'Network connection failed.',
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }

      if (status == 401) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.unauthorized,
            message: message,
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }
      if (status == 403) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.forbidden,
            message: message,
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }
      if (status == 404) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.notFound,
            message: message,
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }
      if (status == 422) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.validationError,
            message: 'Please check your input and try again.',
            code: 'VALIDATION_ERROR',
            statusCode: status,
            requestId: requestId,
            details: _extractFieldErrors(mapData),
          ),
        );
      }
      if (status == 429) {
        final retryAfter = error.response?.headers.value('retry-after');
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.rateLimited,
            message: 'Too many requests. Please wait a moment and try again.',
            code: 'RATE_LIMITED',
            statusCode: status,
            requestId: requestId,
            details: {
              'retryAfter': retryAfter,
              if (details != null) 'originalDetails': details,
            },
          ),
        );
      }
      if (status == 400 || status == 409 || code == 'VALIDATION_ERROR') {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.validationError,
            message: message,
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }

      if (status != null && status >= 500) {
        return _logFailure(
          error,
          AppFailure(
            type: AppFailureType.serverError,
            message: message,
            code: code,
            statusCode: status,
            requestId: requestId,
            details: details,
          ),
        );
      }

      return _logFailure(
        error,
        AppFailure(
          type: AppFailureType.unknown,
          message: message,
          code: code,
          statusCode: status,
          requestId: requestId,
          details: details,
        ),
      );
    }

    if (error is FormatException || error is TypeError) {
      return _logFailure(
        error,
        const AppFailure(
          type: AppFailureType.parseError,
          message: 'Unexpected response format. Please try again.',
          code: 'PARSE_ERROR',
        ),
      );
    }

    return _logFailure(
      error,
      AppFailure(
          type: AppFailureType.unknown, message: 'Unexpected error: $error'),
    );
  }

  Map<String, List<String>>? _extractFieldErrors(Map<String, dynamic> mapData) {
    final raw = mapData['errors'] ?? mapData['details'];
    if (raw is! Map) return null;

    final fieldErrors = <String, List<String>>{};
    raw.forEach((key, value) {
      if (key is! String) return;

      if (value is List) {
        final items =
            value.map((item) => item.toString()).toList(growable: false);
        if (items.isNotEmpty) {
          fieldErrors[key] = items;
        }
      } else if (value is String) {
        fieldErrors[key] = [value];
      }
    });

    return fieldErrors.isEmpty ? null : fieldErrors;
  }

  AppFailure _logFailure(Object error, AppFailure failure) {
    debugPrint(
      '[ApiErrorMapper] type=${failure.type} status=${failure.statusCode} code=${failure.code} message=${failure.message} error=$error',
    );
    if (failure.type != AppFailureType.unauthorized) {
      ErrorReporter.reportApiError(failure);
    }
    return failure;
  }
}
