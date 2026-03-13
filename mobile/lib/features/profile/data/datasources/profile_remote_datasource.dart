import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope_parser.dart';
import '../models/user_profile_model.dart';

class ProfileRemoteDataSource {
  ProfileRemoteDataSource(this._dio);

  final Dio _dio;

  Future<UserProfileModel> getProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/user/profile');
    return parseApiEnvelopeData(
        response: response, fromData: UserProfileModel.fromJson);
  }

  Future<UserProfileModel> updateProfile({
    String? name,
    String? phone,
    String? dateOfBirth,
  }) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/user/profile',
      data: {
        if (name != null) 'name': name,
        if (phone != null) 'phone': phone,
        if (dateOfBirth != null) 'dateOfBirth': dateOfBirth,
      },
    );

    return parseApiEnvelopeData(
        response: response, fromData: UserProfileModel.fromJson);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/user/change-password',
      data: {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      },
    );

    parseApiEnvelopeData<bool>(
        response: response, fromData: (raw) => raw == true);
  }

  Future<String> uploadAvatar({
    required String filePath,
    String? fileName,
  }) async {
    final multipartFile = await MultipartFile.fromFile(
      filePath,
      filename: fileName,
    );
    final formData = FormData.fromMap({'avatar': multipartFile});

    final response = await _dio.post<Map<String, dynamic>>(
      '/user/upload-avatar',
      data: formData,
    );

    final data = parseApiEnvelopeData<Map<String, dynamic>>(
      response: response,
      fromData: (raw) =>
          raw is Map<String, dynamic> ? raw : <String, dynamic>{},
    );

    return (data['avatarUrl'] ?? '').toString();
  }
}
