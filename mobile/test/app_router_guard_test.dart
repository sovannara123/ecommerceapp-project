import 'package:ecommerce_mobile/app/app.dart';
import 'package:ecommerce_mobile/core/config/app_config.dart';
import 'package:ecommerce_mobile/core/config/providers.dart';
import 'package:ecommerce_mobile/features/auth/domain/entities/auth_session.dart';
import 'package:ecommerce_mobile/features/auth/presentation/controllers/auth_session_controller.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class _UnauthenticatedSessionController extends AuthSessionController {
  @override
  Future<AuthSession> build() async {
    return const AuthSession(initialized: true, isAuthenticated: false);
  }
}

class _AuthenticatedSessionController extends AuthSessionController {
  @override
  Future<AuthSession> build() async {
    return const AuthSession(
      initialized: true,
      isAuthenticated: true,
      userEmail: 'user@example.com',
    );
  }
}

class _ErrorSessionController extends AuthSessionController {
  @override
  Future<AuthSession> build() async {
    throw StateError('bootstrap failure');
  }
}

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('unauthenticated user is redirected to login', (tester) async {
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appConfigProvider.overrideWithValue(const AppConfig(apiBaseUrl: 'http://localhost:8080/api')),
          sharedPreferencesProvider.overrideWithValue(prefs),
          secureStorageProvider.overrideWithValue(const FlutterSecureStorage()),
          authSessionControllerProvider.overrideWith(_UnauthenticatedSessionController.new),
        ],
        child: const EcommerceApp(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Sign in'), findsWidgets);
  });

  testWidgets('authenticated user is redirected away from login', (tester) async {
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appConfigProvider.overrideWithValue(const AppConfig(apiBaseUrl: 'http://localhost:8080/api')),
          sharedPreferencesProvider.overrideWithValue(prefs),
          secureStorageProvider.overrideWithValue(const FlutterSecureStorage()),
          authSessionControllerProvider.overrideWith(_AuthenticatedSessionController.new),
        ],
        child: const EcommerceApp(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Northstar Commerce'), findsOneWidget);
  });

  testWidgets('auth bootstrap error redirects to login instead of splash loop', (tester) async {
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          appConfigProvider.overrideWithValue(const AppConfig(apiBaseUrl: 'http://localhost:8080/api')),
          sharedPreferencesProvider.overrideWithValue(prefs),
          secureStorageProvider.overrideWithValue(const FlutterSecureStorage()),
          authSessionControllerProvider.overrideWith(_ErrorSessionController.new),
        ],
        child: const EcommerceApp(),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('Sign in'), findsWidgets);
  });
}
