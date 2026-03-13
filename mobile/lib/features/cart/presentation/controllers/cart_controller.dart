import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../models/cart.dart';
import '../../repositories/cart_repo.dart';

@immutable
class CartState {
  const CartState({
    this.cart,
    this.loadingInitial = false,
    this.updatingItemIds = const {},
    this.clearing = false,
    this.applyingCoupon = false,
    this.error,
  });

  final Cart? cart;

  /// True only during the first fetch (show skeleton).
  final bool loadingInitial;

  /// Product IDs whose quantity is being updated — show per-row spinner.
  final Set<String> updatingItemIds;

  /// True while the "clear cart" action is in flight.
  final bool clearing;

  /// True while a coupon code is being validated server-side.
  final bool applyingCoupon;

  final String? error;

  CartState copyWith({
    Cart? cart,
    bool clearCart = false,
    bool? loadingInitial,
    Set<String>? updatingItemIds,
    bool? clearing,
    bool? applyingCoupon,
    String? error,
    bool clearError = false,
  }) {
    return CartState(
      cart: clearCart ? null : (cart ?? this.cart),
      loadingInitial: loadingInitial ?? this.loadingInitial,
      updatingItemIds: updatingItemIds ?? this.updatingItemIds,
      clearing: clearing ?? this.clearing,
      applyingCoupon: applyingCoupon ?? this.applyingCoupon,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final cartControllerProvider = NotifierProvider<CartController, CartState>(
  CartController.new,
);

class CartController extends Notifier<CartState> {
  @override
  CartState build() {
    fetchCart();
    return const CartState();
  }

  Future<void> refresh() => fetchCart();

  Future<void> fetchCart() async {
    state = state.copyWith(loadingInitial: true, clearError: true);
    try {
      final out = await ref.read(cartRepoProvider).getCart();
      state = state.copyWith(
        cart: out,
        loadingInitial: false,
        clearError: true,
      );
    } catch (error) {
      state = state.copyWith(
        loadingInitial: false,
        error: ref.read(apiErrorMapperProvider).map(error).message,
      );
    }
  }

  Future<void> updateQty(String productId, int qty) async {
    if (qty < 1) {
      await removeItem(productId);
      return;
    }

    final pending = {...state.updatingItemIds, productId};
    state = state.copyWith(updatingItemIds: pending, clearError: true);

    try {
      final out = await ref
          .read(cartRepoProvider)
          .updateQty(productId: productId, qty: qty);
      pending.remove(productId);
      state = state.copyWith(
        cart: out,
        updatingItemIds: pending,
        clearError: true,
      );
    } catch (error) {
      pending.remove(productId);
      state = state.copyWith(
        updatingItemIds: pending,
        error: ref.read(apiErrorMapperProvider).map(error).message,
      );
    }
  }

  Future<void> removeItem(String productId) async {
    final pending = {...state.updatingItemIds, productId};
    state = state.copyWith(updatingItemIds: pending, clearError: true);

    try {
      final out =
          await ref.read(cartRepoProvider).removeItem(productId: productId);
      pending.remove(productId);
      state = state.copyWith(
        cart: out,
        updatingItemIds: pending,
        clearError: true,
      );
    } catch (error) {
      pending.remove(productId);
      state = state.copyWith(
        updatingItemIds: pending,
        error: ref.read(apiErrorMapperProvider).map(error).message,
      );
    }
  }

  Future<void> clearCart() async {
    state = state.copyWith(clearing: true, clearError: true);
    try {
      final out = await ref.read(cartRepoProvider).clearCart();
      state = state.copyWith(
        cart: out,
        clearing: false,
        clearError: true,
      );
    } catch (error) {
      state = state.copyWith(
        clearing: false,
        error: ref.read(apiErrorMapperProvider).map(error).message,
      );
    }
  }

  Future<void> applyCoupon(String code) async {
    state = state.copyWith(applyingCoupon: true, clearError: true);
    try {
      final out = await ref.read(cartRepoProvider).applyCoupon(code);
      state = state.copyWith(
        cart: out,
        applyingCoupon: false,
        clearError: true,
      );
    } catch (error) {
      state = state.copyWith(
        applyingCoupon: false,
        error: ref.read(apiErrorMapperProvider).map(error).message,
      );
    }
  }
}
