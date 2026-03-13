import '../../../../core/utils/result.dart';
import '../../data/models/auth_models.dart';

abstract interface class AuthRepository {
  Future<Result<void>> register({
    required String name,
    required String email,
    required String password,
  });

  Future<Result<LoginResponseDto>> login({
    required String email,
    required String password,
  });

  Future<Result<void>> logout();
}
