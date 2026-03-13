import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'app_routes.dart';
import '../../core/router/page_transitions.dart';
import '../../features/auth/presentation/controllers/auth_session_controller.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/otp_verification_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/reset_password_page.dart';
import '../../features/auth/presentation/pages/shipping_selection_page.dart';
import '../../features/cart/presentation/pages/cart_page.dart';
import '../../features/categories/presentation/pages/category_listing_page.dart';
import '../../features/checkout/presentation/pages/checkout_page.dart';
import '../../features/checkout/presentation/pages/order_review_page.dart';
import '../../features/checkout/presentation/pages/payment_failure_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/orders/presentation/pages/order_detail_page.dart';
import '../../features/orders/presentation/pages/order_tracking_page.dart';
import '../../features/orders/presentation/pages/orders_page.dart';
import '../../features/payments/models/payway_payment.dart';
import '../../features/payments/presentation/pages/payway_webview_page.dart';
import '../../features/products/presentation/pages/product_detail_page.dart';
import '../../features/products/presentation/pages/home_page.dart';
import '../../features/profile/presentation/pages/edit_profile_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/search/presentation/pages/search_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/support/presentation/pages/help_page.dart';
import '../../features/wishlist/presentation/pages/wishlist_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/about/presentation/pages/about_page.dart';
import '../../shared/widgets/bottom_nav_shell.dart';

final _routerNotifierProvider = Provider<ValueNotifier<int>>((ref) {
  final notifier = ValueNotifier<int>(0);
  ref.listen<AsyncValue>(authSessionControllerProvider, (_, __) {
    notifier.value++;
  });
  ref.onDispose(notifier.dispose);
  return notifier;
});

final appRouterProvider = Provider<GoRouter>((ref) {
  final refreshListenable = ref.watch(_routerNotifierProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    refreshListenable: refreshListenable,
    redirect: (context, state) {
      final authState = ref.read(authSessionControllerProvider);
      final location = state.matchedLocation;

      final isSplash = location == AppRoutes.splash;
      final isOnboarding = location == AppRoutes.onboarding;
      final isAuth = location == AppRoutes.login ||
          location == AppRoutes.register ||
          location == '/forgot-password' ||
          location == '/otp-verification' ||
          location == '/reset-password';

      if (isSplash) {
        return null;
      }

      if (authState.isLoading) {
        return AppRoutes.splash;
      }

      // Fail closed to login on auth bootstrap errors to avoid splash loops.
      if (authState.hasError) {
        return isAuth ? null : AppRoutes.login;
      }

      final session = authState.value;
      if (session == null || !session.initialized) {
        return isSplash ? null : AppRoutes.splash;
      }

      if (!session.isAuthenticated) {
        return isAuth || isOnboarding ? null : AppRoutes.login;
      }

      if (isAuth || isOnboarding) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: AppRoutes.login,
        pageBuilder: (context, state) => fadeTransitionPage(
          key: state.pageKey,
          child: const LoginPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.register,
        pageBuilder: (context, state) => fadeTransitionPage(
          key: state.pageKey,
          child: const RegisterPage(),
        ),
      ),
      GoRoute(
        path: '/forgot-password',
        pageBuilder: (context, state) => fadeTransitionPage(
          key: state.pageKey,
          child: const ForgotPasswordPage(),
        ),
      ),
      GoRoute(
        path: '/otp-verification',
        pageBuilder: (context, state) => slideTransitionPage(
          key: state.pageKey,
          child: OtpVerificationPage(
            email: state.extra is String ? state.extra as String : '',
          ),
        ),
      ),
      GoRoute(
        path: '/reset-password',
        pageBuilder: (context, state) {
          final data = state.extra is Map<String, String>
              ? state.extra as Map<String, String>
              : const <String, String>{};
          return slideTransitionPage(
            key: state.pageKey,
            child: ResetPasswordPage(
              email: data['email'] ?? '',
              otp: data['otp'] ?? '',
            ),
          );
        },
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            BottomNavShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoutes.home,
              pageBuilder: (context, state) => fadeTransitionPage(
                key: state.pageKey,
                child: const HomePage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/categories',
              pageBuilder: (context, state) => fadeTransitionPage(
                key: state.pageKey,
                child: const CategoryListingPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoutes.cart,
              pageBuilder: (context, state) => fadeTransitionPage(
                key: state.pageKey,
                child: const CartPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/wishlist',
              pageBuilder: (context, state) => fadeTransitionPage(
                key: state.pageKey,
                child: const WishlistPage(),
              ),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: AppRoutes.profile,
              pageBuilder: (context, state) => fadeTransitionPage(
                key: state.pageKey,
                child: const ProfilePage(),
              ),
              routes: [
                GoRoute(
                  path: 'edit',
                  pageBuilder: (context, state) => slideTransitionPage(
                    key: state.pageKey,
                    child: const EditProfilePage(),
                  ),
                ),
                GoRoute(
                  path: 'settings',
                  pageBuilder: (context, state) => slideTransitionPage(
                    key: state.pageKey,
                    child: const SettingsPage(),
                  ),
                ),
                GoRoute(
                  path: 'help',
                  pageBuilder: (context, state) => slideTransitionPage(
                    key: state.pageKey,
                    child: const HelpPage(),
                  ),
                ),
                GoRoute(
                  path: 'about',
                  pageBuilder: (context, state) => slideTransitionPage(
                    key: state.pageKey,
                    child: const AboutPage(),
                  ),
                ),
              ],
            ),
          ]),
        ],
      ),
      GoRoute(
        path: '/search',
        pageBuilder: (context, state) => slideTransitionPage(
          key: state.pageKey,
          child: const SearchPage(),
        ),
      ),
      GoRoute(
        path: '${AppRoutes.product}/:id',
        pageBuilder: (context, state) {
          final productId = state.pathParameters['id'] ?? '';
          return slideTransitionPage(
            key: state.pageKey,
            child: ProductDetailPage(productId: productId),
          );
        },
      ),
      GoRoute(
        path: AppRoutes.checkout,
        pageBuilder: (context, state) => slideTransitionPage(
          key: state.pageKey,
          child: const CheckoutPage(),
        ),
        routes: [
          GoRoute(
            path: 'shipping',
            pageBuilder: (context, state) => slideTransitionPage(
              key: state.pageKey,
              child: const ShippingSelectionPage(),
            ),
          ),
          GoRoute(
            path: 'review',
            pageBuilder: (context, state) => slideTransitionPage(
              key: state.pageKey,
              child: const OrderReviewPage(),
            ),
          ),
          GoRoute(
            path: 'payment-failure',
            pageBuilder: (context, state) => slideTransitionPage(
              key: state.pageKey,
              child: PaymentFailurePage(
                errorMessage:
                    state.extra is String ? state.extra as String : null,
              ),
            ),
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.orders,
        pageBuilder: (context, state) => slideTransitionPage(
          key: state.pageKey,
          child: const OrdersPage(),
        ),
        routes: [
          GoRoute(
            path: ':id',
            pageBuilder: (context, state) => slideTransitionPage(
              key: state.pageKey,
              child: OrderDetailPage(
                orderId: state.pathParameters['id'] ?? '',
              ),
            ),
            routes: [
              GoRoute(
                path: 'tracking',
                pageBuilder: (context, state) => slideTransitionPage(
                  key: state.pageKey,
                  child: OrderTrackingPage(
                    orderId: state.pathParameters['id'] ?? '',
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: AppRoutes.payway,
        pageBuilder: (context, state) {
          final extra = state.extra;
          if (extra is PaywayWebViewArgs) {
            return slideTransitionPage(
              key: state.pageKey,
              child: PaywayWebViewPage(args: extra),
            );
          }
          return fadeTransitionPage(
            key: state.pageKey,
            child: const _MissingPaywayPayloadPage(),
          );
        },
      ),
      GoRoute(
        path: '/notifications',
        pageBuilder: (context, state) => slideTransitionPage(
          key: state.pageKey,
          child: const NotificationsPage(),
        ),
      ),
    ],
  );
});

class _MissingPaywayPayloadPage extends StatelessWidget {
  const _MissingPaywayPayloadPage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Missing PayWay checkout payload')),
    );
  }
}
