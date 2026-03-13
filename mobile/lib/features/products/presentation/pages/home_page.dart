import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:ecommerce_mobile/app/router/app_routes.dart';
import 'package:ecommerce_mobile/core/network/dio_provider.dart';
import 'package:ecommerce_mobile/features/auth/presentation/controllers/auth_session_controller.dart';
import 'package:ecommerce_mobile/features/catalog/models/product.dart';
import 'package:ecommerce_mobile/features/catalog/repositories/catalog_repo.dart';
import 'package:ecommerce_mobile/core/widgets/offline_banner.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _requestId = 0;
  List<Product> _products = const [];
  String? _nextCursor;
  bool _loading = true;
  bool _loadingMore = false;
  bool _isFromCache = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load(reset: true);
  }

  Future<void> _load({required bool reset}) async {
    final currentId = ++_requestId;

    if (reset) {
      setState(() {
        _products = const [];
        _nextCursor = null;
        _loading = true;
        _error = null;
      });
    } else {
      setState(() => _loadingMore = true);
    }

    try {
      final page = await ref.read(catalogRepoProvider).listProducts(
            limit: 20,
            cursor: reset ? null : _nextCursor,
          );
      if (!mounted || currentId != _requestId) return;
      setState(() {
        _products = (reset || page.isFromCache)
            ? page.items
            : [..._products, ...page.items];
        _nextCursor = page.nextCursor;
        _isFromCache = page.isFromCache;
        _loading = false;
        _loadingMore = false;
        _error = null;
      });
    } catch (error) {
      if (!mounted || currentId != _requestId) return;
      final failure = ref.read(apiErrorMapperProvider).map(error);
      setState(() {
        _error = failure.message;
        _loading = false;
        _loadingMore = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(authSessionControllerProvider).value;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Northstar Commerce'),
        actions: [
          IconButton(
            onPressed: () => context.push(AppRoutes.cart),
            icon: const Icon(Icons.shopping_cart_outlined),
          ),
          IconButton(
            onPressed: () => context.push(AppRoutes.orders),
            icon: const Icon(Icons.receipt_long_outlined),
          ),
          IconButton(
            onPressed: () => context.go(AppRoutes.profile),
            icon: const Icon(Icons.account_circle_outlined),
          ),
          IconButton(
            onPressed: () async {
              await ref.read(authSessionControllerProvider.notifier).logout();
              if (!context.mounted) return;
              context.go(AppRoutes.login);
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Stack(
        children: [
          _loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: () => _load(reset: true),
                  child: ListView(
                    children: [
                      if (session?.userEmail != null)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                          child: Text(
                            'Signed in as ${session!.userEmail}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ),
                      if (_isFromCache)
                        const Padding(
                          padding: EdgeInsets.fromLTRB(16, 0, 16, 8),
                          child: Text(
                            'Showing cached products',
                            style: TextStyle(color: Colors.orange),
                          ),
                        ),
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            _error!,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      if (_products.isEmpty && _error == null)
                        const Padding(
                          padding: EdgeInsets.all(24),
                          child:
                              Center(child: Text('No products available yet.')),
                        ),
                      ..._products.map(
                        (product) => ListTile(
                          leading: product.images.isNotEmpty
                              ? CachedNetworkImage(
                                  imageUrl: product.images.first,
                                  width: 56,
                                  height: 56,
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => const Center(
                                    child: CircularProgressIndicator.adaptive(),
                                  ),
                                  errorWidget: (context, url, error) {
                                    return Container(
                                      color: Colors.grey[200],
                                      child: const Icon(
                                        Icons.broken_image,
                                        size: 48,
                                        color: Colors.grey,
                                      ),
                                    );
                                  },
                                )
                              : null,
                          title: Text(product.title),
                          subtitle:
                              Text('${product.price} ${product.currency}'),
                          onTap: () => context
                              .push('${AppRoutes.product}/${product.id}'),
                        ),
                      ),
                      if (_nextCursor != null)
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: FilledButton(
                            onPressed:
                                _loadingMore ? null : () => _load(reset: false),
                            child:
                                Text(_loadingMore ? 'Loading...' : 'Load more'),
                          ),
                        ),
                    ],
                  ),
                ),
          const Align(
            alignment: Alignment.topCenter,
            child: OfflineBanner(),
          ),
        ],
      ),
    );
  }
}
