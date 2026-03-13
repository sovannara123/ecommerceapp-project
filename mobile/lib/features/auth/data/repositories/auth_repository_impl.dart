import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/auth_session_coordinator.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/utils/result.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import '../models/auth_models.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl({
    required this.remote,
    required this.session,
    required this.ref,
  });

  final AuthRemoteDataSource remote;
  final AuthSessionCoordinator session;
  final Ref ref;

  @override
  Future<Result<void>> register(
      {required String name, required String email, required String password}) {
    return safeApiCall<void>(ref,
        () => remote.register(name: name, email: email, password: password));
  }

  @override
  Future<Result<LoginResponseDto>> login(
      {required String email, required String password}) async {
    return safeApiCall<LoginResponseDto>(ref, () async {
      final response = await remote.login(email: email, password: password);
      await session.setTokens(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );
      return response;
    });
  }

  @override
  Future<Result<void>> logout() async {
    return safeApiCall<void>(ref, () async {
      try {
        await remote.logout();
      } finally {
        // Always clear local session, even when server logout fails due to an
        // expired/invalid access token.
        await session.clear();
      }
    });
  }
}
