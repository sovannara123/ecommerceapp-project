import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope_parser.dart';
import '../models/notification_model.dart';

class NotificationRemoteDataSource {
  NotificationRemoteDataSource(this._dio);

  final Dio _dio;

  Future<NotificationPageModel> getNotifications({
    int page = 1,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/notifications',
      queryParameters: {'page': page},
    );

    return parseApiEnvelopeData(
      response: response,
      fromData: NotificationPageModel.fromJson,
    );
  }

  Future<NotificationModel> markRead(String id) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/notifications/$id/read',
    );

    return parseApiEnvelopeData(
      response: response,
      fromData: NotificationModel.fromJson,
    );
  }

  Future<void> markAllRead() async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/notifications/read-all',
    );

    parseApiEnvelopeData<bool>(
      response: response,
      fromData: (raw) => raw == true,
    );
  }

  Future<void> registerFcmToken(String token) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/notifications/register-token',
      data: {
        'token': token,
        'platform': 'fcm',
      },
    );

    parseApiEnvelopeData<Map<String, dynamic>>(
      response: response,
      fromData: (raw) =>
          raw is Map<String, dynamic> ? raw : <String, dynamic>{},
    );
  }
}
