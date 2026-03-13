import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../../../core/utils/result.dart';
import '../datasources/profile_remote_datasource.dart';
import '../models/user_profile_model.dart';

final profileRemoteDataSourceProvider =
    Provider<ProfileRemoteDataSource>((ref) {
  return ProfileRemoteDataSource(ref.watch(dioProvider));
});

final profileRepositoryProvider = Provider<ProfileRepositoryImpl>((ref) {
  final remote = ref.watch(profileRemoteDataSourceProvider);
  return ProfileRepositoryImpl(remote: remote, ref: ref);
});

class ProfileRepositoryImpl {
  ProfileRepositoryImpl({required this.remote, required this.ref});

  final ProfileRemoteDataSource remote;
  final Ref ref;

  Future<Result<UserProfileModel>> getProfile() {
    return safeApiCall<UserProfileModel>(ref, remote.getProfile);
  }

  Future<Result<UserProfileModel>> updateProfile({
    String? name,
    String? phone,
    String? dateOfBirth,
  }) {
    return safeApiCall<UserProfileModel>(
      ref,
      () => remote.updateProfile(
        name: name,
        phone: phone,
        dateOfBirth: dateOfBirth,
      ),
    );
  }

  Future<Result<void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) {
    return safeApiCall<void>(
      ref,
      () => remote.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      ),
    );
  }

  Future<Result<String>> uploadAvatar({
    required String filePath,
    String? fileName,
  }) {
    return safeApiCall<String>(
      ref,
      () => remote.uploadAvatar(filePath: filePath, fileName: fileName),
    );
  }
}
