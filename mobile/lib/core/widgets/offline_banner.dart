import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/connectivity_provider.dart';

class OfflineBanner extends ConsumerStatefulWidget {
  const OfflineBanner({super.key});

  @override
  ConsumerState<OfflineBanner> createState() => _OfflineBannerState();
}

class _OfflineBannerState extends ConsumerState<OfflineBanner> {
  @override
  Widget build(BuildContext context) {
    final connectedAsync = ref.watch(connectivityProvider);
    final isOnline = connectedAsync.valueOrNull ?? true;

    if (isOnline) {
      return const SizedBox.shrink();
    }

    return MaterialBanner(
      content: const Text('You are offline'),
      backgroundColor: Theme.of(context).colorScheme.errorContainer,
      actions: [
        TextButton(
          onPressed: () => ref.invalidate(connectivityProvider),
          child: const Text('Retry'),
        ),
      ],
    );
  }
}
