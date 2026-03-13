import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/cache/offline_queue_service.dart';
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
    // TODO: uncomment when provider is created
    // ref.invalidate(wishlistControllerProvider);
    // TODO: uncomment when provider is created
    // ref.invalidate(notificationControllerProvider);
    ref.invalidate(syncServiceProvider);
    ref.invalidate(offlineQueueServiceProvider);

    return result;
  }
}
