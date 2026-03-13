import 'dart:async';
import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/cache/offline_queue_service.dart';
import '../../../core/config/providers.dart';
import '../../../core/network/api_envelope_parser.dart';
import '../../../core/network/connectivity_service.dart';
import '../../../core/network/dio_provider.dart';
import '../../../core/sync/sync_service.dart';
import '../models/cart.dart';
import '../models/cart_item.dart';

final cartRepoProvider = Provider<CartRepo>((ref) {
  final repo = CartRepo(
    ref.watch(dioProvider),
    ref.watch(sharedPreferencesProvider),
    ref.watch(offlineQueueServiceProvider),
    ref.watch(connectivityServiceProvider),
    ref.watch(syncServiceProvider),
  );

  unawaited(repo.syncOnAppStart());
  return repo;
});

class CartRepo {
  CartRepo(
    this._dio,
    this._prefs,
    this._queueService,
    this._connectivityService,
    this._syncService,
  );

  static const _cartCacheKey = 'cache_cart';

  final Dio _dio;
  final SharedPreferences _prefs;
  final OfflineQueueService _queueService;
  final ConnectivityService _connectivityService;
  final SyncService _syncService;

  Future<void> syncOnAppStart() async {
    final connected = await _connectivityService.isConnected;
    if (!connected) return;
    if (_queueService.getQueue().isEmpty) return;

    await _syncService.syncPendingOperations();
  }

  Future<Cart> getCart() async {
    final connected = await _connectivityService.isConnected;

    if (connected) {
      try {
        final res = await _dio.get<Map<String, dynamic>>('/cart');
        final cart = parseApiEnvelopeData(
          response: res,
          fromData: _normalizeCart,
        );
        await _saveCachedCart(cart);
        return cart;
      } catch (error) {
        if (!_isNetworkFailure(error)) rethrow;
      }
    }

    final cached = _getCachedCart();
    if (cached != null) {
      return cached;
    }

    if (!connected) {
      return _emptyCart();
    }

    throw DioException(
      requestOptions: RequestOptions(path: '/cart'),
      type: DioExceptionType.connectionError,
      error: 'Unable to load cart',
    );
  }

  Future<Cart> addToCart({
    required String productId,
    required int qty,
  }) async {
    return _runOperation(
      action: OfflineQueueAction.add,
      payload: {
        'productId': productId,
        'qty': qty,
      },
      onlineCall: () async {
        final res = await _dio.post<Map<String, dynamic>>(
          '/cart/add',
          data: {
            'productId': productId,
            'qty': qty,
          },
        );
        return parseApiEnvelopeData(response: res, fromData: _normalizeCart);
      },
      optimisticUpdate: (current) {
        final items = [...current.items];
        final index = items.indexWhere((item) => item.productId == productId);

        if (index >= 0) {
          final item = items[index];
          items[index] = item.copyWith(qty: item.qty + qty);
        } else {
          items.add(CartItem(productId: productId, qty: qty, priceSnapshot: 0));
        }

        return _withRecalculatedTotals(current.copyWith(items: items));
      },
    );
  }

  Future<Cart> updateQty({
    required String productId,
    required int qty,
  }) async {
    return _runOperation(
      action: OfflineQueueAction.update,
      payload: {
        'productId': productId,
        'qty': qty,
      },
      onlineCall: () async {
        final res = await _dio.post<Map<String, dynamic>>(
          '/cart/update',
          data: {
            'productId': productId,
            'qty': qty,
          },
        );
        return parseApiEnvelopeData(response: res, fromData: _normalizeCart);
      },
      optimisticUpdate: (current) {
        final items = [...current.items];
        final index = items.indexWhere((item) => item.productId == productId);

        if (qty <= 0) {
          final next = items
              .where((item) => item.productId != productId)
              .toList(growable: false);
          return _withRecalculatedTotals(current.copyWith(items: next));
        }

        if (index >= 0) {
          items[index] = items[index].copyWith(qty: qty);
          return _withRecalculatedTotals(current.copyWith(items: items));
        }

        items.add(CartItem(productId: productId, qty: qty, priceSnapshot: 0));
        return _withRecalculatedTotals(current.copyWith(items: items));
      },
    );
  }

  Future<Cart> removeItem({required String productId}) async {
    return _runOperation(
      action: OfflineQueueAction.remove,
      payload: {'productId': productId},
      onlineCall: () async {
        final res = await _dio.post<Map<String, dynamic>>(
          '/cart/remove',
          data: {'productId': productId},
        );
        return parseApiEnvelopeData(response: res, fromData: _normalizeCart);
      },
      optimisticUpdate: (current) {
        final next = current.items
            .where((item) => item.productId != productId)
            .toList(growable: false);
        return _withRecalculatedTotals(current.copyWith(items: next));
      },
    );
  }

  Future<Cart> clearCart() async {
    return _runOperation(
      action: OfflineQueueAction.clear,
      payload: const <String, dynamic>{},
      onlineCall: () async {
        final res = await _dio.post<Map<String, dynamic>>('/cart/clear');
        return parseApiEnvelopeData(response: res, fromData: _normalizeCart);
      },
      optimisticUpdate: (current) =>
          _withRecalculatedTotals(current.copyWith(items: const <CartItem>[])),
    );
  }

  Future<Cart> applyCoupon(String code) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/cart/apply-coupon',
      data: {'code': code},
    );
    final cart = parseApiEnvelopeData(response: res, fromData: _normalizeCart);
    await _saveCachedCart(cart);
    return cart;
  }

  Future<Cart> _runOperation({
    required OfflineQueueAction action,
    required Map<String, dynamic> payload,
    required Future<Cart> Function() onlineCall,
    required Cart Function(Cart current) optimisticUpdate,
  }) async {
    final connected = await _connectivityService.isConnected;

    if (connected) {
      try {
        final cart = await onlineCall();
        await _saveCachedCart(cart);
        return cart;
      } catch (error) {
        if (!_isNetworkFailure(error)) {
          rethrow;
        }
      }
    }

    final current = _getCachedCart() ?? _emptyCart();
    final optimisticCart = optimisticUpdate(current);

    await _saveCachedCart(optimisticCart);
    await _queueService.addToQueue(action, payload);

    return optimisticCart;
  }

  Future<void> _saveCachedCart(Cart cart) async {
    await _prefs.setString(_cartCacheKey, jsonEncode(cart.toJson()));
  }

  Cart? _getCachedCart() {
    final encoded = _prefs.getString(_cartCacheKey);
    if (encoded == null || encoded.isEmpty) {
      return null;
    }

    try {
      final raw = jsonDecode(encoded);
      if (raw is! Map) {
        return null;
      }
      return Cart.fromJson(
        raw.map((key, value) => MapEntry(key.toString(), value)),
      );
    } catch (_) {
      return null;
    }
  }

  Cart _emptyCart() {
    return const Cart(items: <CartItem>[]);
  }

  Cart _normalizeCart(dynamic raw) {
    final json = raw is Map<String, dynamic>
        ? raw
        : (raw is Map
            ? raw.map((key, value) => MapEntry(key.toString(), value))
            : <String, dynamic>{});

    final mapped = <String, dynamic>{
      ...json,
      'subtotalCents': _moneyToCents(json['subtotalCents'] ?? json['subtotal']),
      'shippingCents':
          _moneyToCents(json['shippingCents'] ?? json['shippingFee']),
      'taxCents': _moneyToCents(json['taxCents'] ?? json['tax']),
      'discountCents': _moneyToCents(json['discountCents'] ?? json['discount']),
      'couponCode': (json['couponCode'] ?? json['coupon'])?.toString(),
    };

    return Cart.fromJson(mapped);
  }

  Cart _withRecalculatedTotals(Cart cart) {
    final subtotalCents = cart.items.fold<int>(
      0,
      (sum, item) => sum + _moneyToCents(item.priceSnapshot) * item.qty,
    );

    return cart.copyWith(subtotalCents: subtotalCents);
  }

  int _moneyToCents(dynamic raw) {
    if (raw is int) return raw;
    if (raw is num) return (raw * 100).round();
    final parsed = double.tryParse(raw?.toString() ?? '');
    if (parsed == null) return 0;
    return (parsed * 100).round();
  }

  bool _isNetworkFailure(Object error) {
    if (error is! DioException) return false;
    if (error.response == null) return true;
    return error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.sendTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError;
  }
}
