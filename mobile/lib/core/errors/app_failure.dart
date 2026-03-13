import 'package:flutter/foundation.dart';

@immutable
class AppFailure {
  const AppFailure({
    required this.type,
    required this.message,
    this.code,
    this.statusCode,
    this.requestId,
    this.details,
  });

  final AppFailureType type;
  final String message;
  final String? code;
  final int? statusCode;
  final String? requestId;
  final Object? details;
}

enum AppFailureType {
  networkError,
  timeout,
  parseError,
  rateLimited,
  serverError,
  unauthorized,
  forbidden,
  validationError,
  notFound,
  unknown,
}
