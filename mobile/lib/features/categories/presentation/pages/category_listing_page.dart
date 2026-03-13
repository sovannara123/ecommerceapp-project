import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class Category {
  final String id;
  final String name;
  final IconData icon;

  const Category({
    required this.id,
    required this.name,
    required this.icon,
  });
}

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  await Future.delayed(const Duration(seconds: 1));
  return const [
    Category(id: '1', name: 'Electronics', icon: Icons.devices),
    Category(id: '2', name: 'Fashion', icon: Icons.checkroom),
    Category(id: '3', name: 'Home & Garden', icon: Icons.home),
    Category(id: '4', name: 'Sports', icon: Icons.sports_soccer),
    Category(id: '5', name: 'Books', icon: Icons.menu_book),
    Category(id: '6', name: 'Beauty', icon: Icons.face),
    Category(id: '7', name: 'Toys', icon: Icons.toys),
    Category(id: '8', name: 'Groceries', icon: Icons.local_grocery_store),
  ];
});

class CategoryListingPage extends ConsumerWidget {
  const CategoryListingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Categories')),
      body: categoriesAsync.when(
        loading: () => GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1.2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: 8,
          itemBuilder: (_, __) => Card(
            child: Container(
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest
                    .withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.error_outline,
                size: 48,
                color: theme.colorScheme.error,
              ),
              const SizedBox(height: 16),
              const Text('Failed to load categories'),
              const SizedBox(height: 8),
              FilledButton.tonal(
                onPressed: () => ref.invalidate(categoriesProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (categories) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(categoriesProvider);
            await ref.read(categoriesProvider.future);
          },
          child: GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: categories.length,
            itemBuilder: (_, index) {
              final category = categories[index];
              return Card(
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () =>
                      context.push('/products?category=${category.id}'),
                  borderRadius: BorderRadius.circular(12),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primaryContainer,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          category.icon,
                          size: 32,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        category.name,
                        style: theme.textTheme.titleSmall,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
