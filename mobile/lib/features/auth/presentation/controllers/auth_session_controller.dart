import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/cache/offline_queue_service.dart';
import '../../../../core/errors/app_failure.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/sync/sync_service.dart';
import '../../../../core/utils/result.dart';
import '../../../cart/presentation/controllers/cart_controller.dart';
import '../../../checkout/presentation/controllers/checkout_controller.dart';
import '../../../orders/presentation/controllers/orders_controller.dart';
import '../../data/datasources/auth_remote_data_source.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthRemoteDataSource(dio);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final remote = ref.watch(authRemoteDataSourceProvider);
  final session = ref.watch(authSessionCoordinatorProvider);
  return AuthRepositoryImpl(remote: remote, session: session, ref: ref);
});

final authSessionControllerProvider =
    AsyncNotifierProvider<AuthSessionController, AuthSession>(
  AuthSessionController.new,
);

class AuthSessionController extends AsyncNotifier<AuthSession> {
  @override
  Future<AuthSession> build() async {
    final session = ref.read(authSessionCoordinatorProvider);
    session.onSessionExpired = () {
      state = const AsyncData(
          AuthSession(initialized: true, isAuthenticated: false));
    };
    await session.hydrate();

    return AuthSession(
      initialized: true,
      isAuthenticated: session.isAuthenticated,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );
  }

  Future<Result<void>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final repository = ref.read(authRepositoryProvider);
    return repository.register(name: name, email: email, password: password);
  }

  Future<Result<void>> login({
    required String email,
    required String password,
  }) async {
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.login(email: email, password: password);

    return result.when(
      success: (data) {
        state = AsyncData(
          AuthSession(
            initialized: true,
            isAuthenticated: true,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            userEmail: data.user.email,
            userName: data.user.name,
            userRole: data.user.role,
          ),
        );
        return const Success<void>(null);
      },
      failure: (failure) => Failure<void>(failure),
    );
  }

  Future<Result<void>> restoreFromSecureSession() async {
    final session = ref.read(authSessionCoordinatorProvider);
    await session.hydrate();

    if (!session.isAuthenticated) {
      return const Failure<void>(
        AppFailure(
          type: AppFailureType.unauthorized,
          message: 'No saved session found. Please sign in.',
          code: 'SESSION_NOT_FOUND',
        ),
      );
    }

    final refreshedToken = await session.refreshIfNeeded();
    if (refreshedToken == null ||
        session.accessToken == null ||
        session.refreshToken == null) {
      return const Failure<void>(
        AppFailure(
          type: AppFailureType.unauthorized,
          message: 'Saved session has expired. Please sign in again.',
          code: 'SESSION_EXPIRED',
        ),
      );
    }

    final current = state.valueOrNull;
    state = AsyncData(
      AuthSession(
        initialized: true,
        isAuthenticated: true,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        userEmail: current?.userEmail,
        userName: current?.userName,
        userRole: current?.userRole,
      ),
    );
    return const Success<void>(null);
  }

  /// Logs out the user and invalidates ALL feature-level state so no
  /// data from the previous session leaks into the next one.
  Future<Result<void>> logout() async {
    final repository = ref.read(authRepositoryProvider);
    final result = await repository.logout();

    // 1 — Reset auth state
    state = const AsyncData(
      AuthSession(initialized: true, isAuthenticated: false),
    );

    // 2 — Cascade-invalidate every feature provider that holds
    //     user-scoped data. Add new providers here as features grow.
    ref.invalidate(cartControllerProvider);
    ref.invalidate(checkoutControllerProvider);
    ref.invalidate(ordersControllerProvider);
    // Enable when wishlist provider is introduced.
    // ref.invalidate(wishlistControllerProvider);
    // Enable when notification provider is introduced.
    // ref.invalidate(notificationControllerProvider);
    ref.invalidate(syncServiceProvider);
    ref.invalidate(offlineQueueServiceProvider);

    return result;
  }
}
