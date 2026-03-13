import 'package:go_router/go_router.dart';

import 'app/router/app_routes.dart';
import 'core/router/page_transitions.dart';
import 'features/about/presentation/pages/about_page.dart';
import 'features/auth/presentation/pages/forgot_password_page.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/auth/presentation/pages/otp_verification_page.dart';
import 'features/auth/presentation/pages/register_page.dart';
import 'features/auth/presentation/pages/reset_password_page.dart';
import 'features/auth/presentation/pages/shipping_selection_page.dart';
import 'features/cart/presentation/pages/cart_page.dart';
import 'features/categories/presentation/pages/category_listing_page.dart';
import 'features/checkout/presentation/pages/checkout_page.dart';
import 'features/checkout/presentation/pages/order_review_page.dart';
import 'features/checkout/presentation/pages/payment_failure_page.dart';
import 'features/notifications/presentation/pages/notifications_page.dart';
import 'features/onboarding/presentation/pages/onboarding_page.dart';
import 'features/orders/presentation/pages/order_detail_page.dart';
import 'features/orders/presentation/pages/order_tracking_page.dart';
import 'features/orders/presentation/pages/orders_page.dart';
import 'features/products/presentation/pages/home_page.dart';
import 'features/products/presentation/pages/product_detail_page.dart';
import 'features/profile/presentation/pages/edit_profile_page.dart';
import 'features/profile/presentation/pages/profile_page.dart';
import 'features/search/presentation/pages/search_page.dart';
import 'features/settings/presentation/pages/settings_page.dart';
import 'features/splash/presentation/pages/splash_page.dart';
import 'features/support/presentation/pages/help_page.dart';
import 'features/wishlist/presentation/pages/wishlist_page.dart';
import 'shared/widgets/bottom_nav_shell.dart';

final router = GoRouter(
  initialLocation: AppRoutes.splash,
  routes: [
    GoRoute(
      path: AppRoutes.splash,
      builder: (_, __) => const SplashPage(),
    ),
    GoRoute(
      path: AppRoutes.onboarding,
      builder: (_, __) => const OnboardingPage(),
    ),
    GoRoute(
      path: AppRoutes.login,
      builder: (_, __) => const LoginPage(),
    ),
    GoRoute(
      path: AppRoutes.register,
      builder: (_, __) => const RegisterPage(),
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (_, __) => const ForgotPasswordPage(),
    ),
    GoRoute(
      path: '/otp-verification',
      builder: (_, state) => OtpVerificationPage(
        email: state.extra as String,
      ),
    ),
    GoRoute(
      path: '/reset-password',
      builder: (_, state) {
        final data = state.extra as Map<String, String>;
        return ResetPasswordPage(
          email: data['email'] ?? '',
          otp: data['otp'] ?? '',
        );
      },
    ),
    StatefulShellRoute.indexedStack(
      builder: (_, __, navigationShell) =>
          BottomNavShell(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [
          GoRoute(
            path: AppRoutes.home,
            builder: (_, __) => const HomePage(),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/categories',
            builder: (_, __) => const CategoryListingPage(),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: AppRoutes.cart,
            builder: (_, __) => const CartPage(),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: '/wishlist',
            builder: (_, __) => const WishlistPage(),
          ),
        ]),
        StatefulShellBranch(routes: [
          GoRoute(
            path: AppRoutes.profile,
            builder: (_, __) => const ProfilePage(),
            routes: [
              GoRoute(
                path: 'edit',
                builder: (_, __) => const EditProfilePage(),
              ),
              GoRoute(
                path: 'settings',
                builder: (_, __) => const SettingsPage(),
              ),
              GoRoute(
                path: 'help',
                builder: (_, __) => const HelpPage(),
              ),
              GoRoute(
                path: 'about',
                builder: (_, __) => const AboutPage(),
              ),
            ],
          ),
        ]),
      ],
    ),
    GoRoute(
      path: '/search',
      pageBuilder: (_, state) => slideTransitionPage(
        key: state.pageKey,
        child: const SearchPage(),
      ),
    ),
    GoRoute(
      path: '${AppRoutes.product}/:id',
      pageBuilder: (_, state) => slideTransitionPage(
        key: state.pageKey,
        child: ProductDetailPage(
          productId: state.pathParameters['id']!,
        ),
      ),
    ),
    GoRoute(
      path: AppRoutes.checkout,
      builder: (_, __) => const CheckoutPage(),
      routes: [
        GoRoute(
          path: 'shipping',
          builder: (_, __) => const ShippingSelectionPage(),
        ),
        GoRoute(
          path: 'review',
          builder: (_, __) => const OrderReviewPage(),
        ),
        GoRoute(
          path: 'payment-failure',
          builder: (_, state) => PaymentFailurePage(
            errorMessage: state.extra as String?,
          ),
        ),
      ],
    ),
    GoRoute(
      path: AppRoutes.orders,
      builder: (_, __) => const OrdersPage(),
      routes: [
        GoRoute(
          path: ':id',
          builder: (_, state) => OrderDetailPage(
            orderId: state.pathParameters['id']!,
          ),
          routes: [
            GoRoute(
              path: 'tracking',
              builder: (_, state) => OrderTrackingPage(
                orderId: state.pathParameters['id']!,
              ),
            ),
          ],
        ),
      ],
    ),
    GoRoute(
      path: '/notifications',
      builder: (_, __) => const NotificationsPage(),
    ),
  ],
);
