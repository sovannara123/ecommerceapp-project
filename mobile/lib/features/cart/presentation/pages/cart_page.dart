import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ecommerce_mobile/app/router/app_routes.dart';

import '../../models/cart_item.dart';
import '../controllers/cart_controller.dart';

class CartPage extends ConsumerStatefulWidget {
  const CartPage({super.key});

  @override
  ConsumerState<CartPage> createState() => _CartPageState();
}

class _CartPageState extends ConsumerState<CartPage> {
  Future<void> _updateQty(CartItem item, int qty) async {
    await ref
        .read(cartControllerProvider.notifier)
        .updateQty(item.productId, qty);
    _showErrorIfAny();
  }

  Future<void> _removeItem(String productId) async {
    await ref.read(cartControllerProvider.notifier).removeItem(productId);
    _showErrorIfAny();
  }

  Future<void> _clearCart() async {
    await ref.read(cartControllerProvider.notifier).clearCart();
    _showErrorIfAny();
  }

  void _showErrorIfAny() {
    final message = ref.read(cartControllerProvider).error;
    if (message == null) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartControllerProvider);
    final items = cartState.cart?.items ?? const <CartItem>[];

    return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: cartState.loadingInitial
          ? const Center(child: CircularProgressIndicator())
          : cartState.error != null && cartState.cart == null
              ? Center(child: Text(cartState.error!))
              : Column(
                  children: [
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: () =>
                            ref.read(cartControllerProvider.notifier).refresh(),
                        child: ListView.builder(
                          itemCount: items.length,
                          itemBuilder: (_, index) {
                            final item = items[index];
                            return ListTile(
                              key: ValueKey(item.productId),
                              title: Text('Product ${item.productId}'),
                              subtitle: Text(
                                'Qty: ${item.qty} • ${item.priceSnapshot.toStringAsFixed(2)}',
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    onPressed: cartState.updatingItemIds
                                            .contains(item.productId)
                                        ? null
                                        : item.qty <= 1
                                            ? () async {
                                                final remove = await showDialog<bool>(
                                                  context: context,
                                                  builder: (_) => AlertDialog(
                                                    title: const Text('Remove Item'),
                                                    content: const Text(
                                                      'Remove this item from your cart?',
                                                    ),
                                                    actions: [
                                                      TextButton(
                                                        onPressed: () =>
                                                            Navigator.pop(context, false),
                                                        child: const Text('Cancel'),
                                                      ),
                                                      FilledButton(
                                                        onPressed: () =>
                                                            Navigator.pop(context, true),
                                                        child: const Text('Remove'),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                                if (remove == true) {
                                                  await _removeItem(item.productId);
                                                }
                                              }
                                            : () => _updateQty(item, item.qty - 1),
                                    icon: Icon(
                                      item.qty <= 1
                                          ? Icons.delete_outline
                                          : Icons.remove_circle_outline,
                                      size: 28,
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: cartState.updatingItemIds
                                            .contains(item.productId)
                                        ? null
                                        : () => _updateQty(item, item.qty + 1),
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                  IconButton(
                                    onPressed: cartState.updatingItemIds
                                            .contains(item.productId)
                                        ? null
                                        : () => _removeItem(item.productId),
                                    icon: const Icon(Icons.delete_outline),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal'),
                          Text(
                            '${((cartState.cart?.subtotalCents ?? 0) / 100).toStringAsFixed(2)} USD',
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: items.isEmpty || cartState.clearing
                                  ? null
                                  : _clearCart,
                              child: Text(
                                  cartState.clearing ? 'Clearing...' : 'Clear'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton(
                              onPressed: items.isEmpty
                                  ? null
                                  : () => context.push(AppRoutes.checkout),
                              child: const Text('Checkout'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}
