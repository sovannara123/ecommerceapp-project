import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'providers/app_settings_provider.dart';
import '../features/auth/presentation/controllers/auth_session_controller.dart';
import '../core/theme/app_theme.dart';
import '../core/theme/theme_provider.dart';
import '../core/utils/inactivity_monitor.dart';
import '../core/sync/sync_service.dart';
import 'router/app_router.dart';

class EcommerceApp extends ConsumerWidget {
  const EcommerceApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(syncServiceProvider);
    final settings = ref.watch(appSettingsNotifierProvider);
    final themeMode = ref.watch(themeModeProvider);
    final router = ref.watch(appRouterProvider);
    final authState = ref.watch(authSessionControllerProvider);
    final isAuthenticated = authState.valueOrNull?.isAuthenticated == true;

    return MaterialApp.router(
      title: 'Northstar Commerce',
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      locale: settings.locale,
      routerConfig: router,
      builder: (context, child) {
        final content = child ?? const SizedBox.shrink();
        if (!isAuthenticated) return content;

        return InactivityMonitor(
          onTimeout: () {
            ref.read(authSessionControllerProvider.notifier).logout();
          },
          child: content,
        );
      },
    );
  }
}
