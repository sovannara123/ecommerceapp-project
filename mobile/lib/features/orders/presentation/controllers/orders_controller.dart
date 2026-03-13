import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../models/order.dart';
import '../../repositories/orders_repo.dart';

part 'orders_controller.g.dart';

final ordersRepositoryProvider = ordersRepoProvider;

enum OrderStatusFilter {
  all,
  pending,
  processing,
  shipped,
  delivered,
  cancelled
}

@immutable
class OrdersState {
  const OrdersState({
    this.items = const [],
    this.page = 1,
    this.hasMore = true,
    this.isLoadingMore = false,
    this.filter = OrderStatusFilter.all,
    this.error,
  });

  final List<Order> items;
  final int page;
  final bool hasMore;
  final bool isLoadingMore;
  final OrderStatusFilter filter;
  final String? error;

  OrdersState copyWith({
    List<Order>? items,
    int? page,
    bool? hasMore,
    bool? isLoadingMore,
    OrderStatusFilter? filter,
    String? error,
  }) {
    return OrdersState(
      items: items ?? this.items,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      filter: filter ?? this.filter,
      error: error,
    );
  }
}

@riverpod
class OrdersController extends _$OrdersController {
  @override
  Future<OrdersState> build() async {
    return _fetch(page: 1, filter: OrderStatusFilter.all);
  }

  Future<OrdersState> _fetch({
    required int page,
    required OrderStatusFilter filter,
    List<Order> existing = const [],
  }) async {
    final repo = ref.read(ordersRepositoryProvider);
    final result = await repo.listOrders(
      page: page,
      status: filter == OrderStatusFilter.all ? null : filter.name,
    );
    return OrdersState(
      items: [...existing, ...result.items],
      page: page,
      hasMore: result.hasMore,
      filter: filter,
    );
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore || current.isLoadingMore) return;
    state = AsyncData(current.copyWith(isLoadingMore: true));
    try {
      final next = await _fetch(
        page: current.page + 1,
        filter: current.filter,
        existing: current.items,
      );
      state = AsyncData(next);
    } catch (e) {
      state = AsyncData(
        current.copyWith(
          isLoadingMore: false,
          error: e.toString(),
        ),
      );
    }
  }

  Future<void> setFilter(OrderStatusFilter filter) async {
    state = const AsyncLoading();
    try {
      state = AsyncData(await _fetch(page: 1, filter: filter));
    } catch (e) {
      state = AsyncError(e, StackTrace.current);
    }
  }
}
