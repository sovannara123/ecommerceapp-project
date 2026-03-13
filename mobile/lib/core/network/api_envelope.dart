import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_envelope.freezed.dart';
part 'api_envelope.g.dart';

@Freezed(genericArgumentFactories: true)
class ApiEnvelope<T> with _$ApiEnvelope<T> {
  const factory ApiEnvelope({
    required bool success,
    T? data,
    String? error,
    String? message,
    String? requestId,
    Object? details,
  }) = _ApiEnvelope<T>;

  factory ApiEnvelope.fromJson(Map<String, dynamic> json, T Function(Object? json) fromJsonT) =>
      _$ApiEnvelopeFromJson(json, fromJsonT);
}
