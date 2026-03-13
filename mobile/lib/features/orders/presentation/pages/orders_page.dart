import 'package:ecommerce_mobile/app/router/app_routes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../controllers/orders_controller.dart';

class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
        data: (state) {
          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(ordersControllerProvider);
              await ref.read(ordersControllerProvider.future);
            },
            child: ListView(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                  child: DropdownButtonFormField<OrderStatusFilter>(
                    value: state.filter,
                    decoration: const InputDecoration(labelText: 'Filter by status'),
                    items: OrderStatusFilter.values
                        .map(
                          (value) => DropdownMenuItem<OrderStatusFilter>(
                            value: value,
                            child: Text(value.name),
                          ),
                        )
                        .toList(growable: false),
                    onChanged: (value) {
                      if (value == null) return;
                      ref.read(ordersControllerProvider.notifier).setFilter(value);
                    },
                  ),
                ),
                if (state.error != null)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                    child: Text(
                      state.error!,
                      style: const TextStyle(color: Colors.red),
                    ),
                  ),
                if (state.items.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(24),
                    child: Center(child: Text('No orders found.')),
                  )
                else
                  ...state.items.map(
                    (order) => ListTile(
                      title: Text('Order ${order.id}'),
                      subtitle: Text('${order.status} - ${order.total} ${order.currency}'),
                      onTap: () => context.push('${AppRoutes.orders}/${order.id}'),
                    ),
                  ),
                if (state.hasMore)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: FilledButton(
                      onPressed: state.isLoadingMore
                          ? null
                          : () => ref.read(ordersControllerProvider.notifier).loadMore(),
                      child: Text(state.isLoadingMore ? 'Loading...' : 'Load more'),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
