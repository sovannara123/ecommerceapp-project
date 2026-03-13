import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_envelope_parser.dart';
import '../../../core/network/dio_provider.dart';
import '../models/address.dart';
import '../models/order.dart';
import '../models/order_tracking_model.dart';

final ordersRepoProvider = Provider<OrdersRepo>((ref) {
  return OrdersRepo(ref.watch(dioProvider));
});

class OrdersRepo {
  OrdersRepo(this._dio);

  final Dio _dio;

  static const int _defaultPageSize = 10;

  Future<Order> createOrder({
    required Address address,
    double shippingFee = 0,
    String currency = 'USD',
    String paymentProvider = 'payway',
    String paymentOption = 'abapay_deeplink',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/orders',
      data: {
        'address': address.toJson(),
        'shippingFee': shippingFee,
        'currency': currency,
        'paymentProvider': paymentProvider,
        'paymentOption': paymentOption,
      },
    );
    return parseApiEnvelopeData(response: res, fromData: Order.fromJson);
  }

  Future<List<Order>> listMine() async {
    final res = await _dio.get<Map<String, dynamic>>('/orders/mine');
    return parseApiEnvelopeData(
        response: res,
        fromData: (data) {
          if (data is! List) {
            return const <Order>[];
          }
          return data.map(Order.fromJson).toList(growable: false);
        });
  }

  Future<OrdersListResult> listOrders({
    required int page,
    String? status,
    int limit = _defaultPageSize,
  }) async {
    final all = await listMine();
    final normalizedStatus = status?.trim().toLowerCase();
    final filtered = normalizedStatus == null || normalizedStatus.isEmpty
        ? all
        : all
            .where(
              (order) => order.status.toLowerCase() == normalizedStatus,
            )
            .toList(growable: false);

    final safePage = page < 1 ? 1 : page;
    final safeLimit = limit < 1 ? _defaultPageSize : limit;
    final start = (safePage - 1) * safeLimit;
    if (start >= filtered.length) {
      return const OrdersListResult(items: <Order>[], hasMore: false);
    }

    final end = start + safeLimit;
    final items = filtered.sublist(
      start,
      end > filtered.length ? filtered.length : end,
    );

    return OrdersListResult(
      items: items,
      hasMore: end < filtered.length,
    );
  }

  Future<Order> getMine(String id) async {
    final res = await _dio.get<Map<String, dynamic>>('/orders/mine/$id');
    return parseApiEnvelopeData(response: res, fromData: Order.fromJson);
  }

  Future<Order> cancelOrder({
    required String orderId,
    String reason = '',
  }) async {
    final res = await _dio.put<Map<String, dynamic>>(
      '/orders/$orderId/cancel',
      data: {'cancelReason': reason},
    );
    return parseApiEnvelopeData(response: res, fromData: Order.fromJson);
  }

  Future<Order> requestReturn({
    required String orderId,
    required String reason,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/orders/$orderId/return',
      data: {'returnReason': reason},
    );
    return parseApiEnvelopeData(response: res, fromData: Order.fromJson);
  }

  Future<OrderTrackingModel> trackOrder(String orderId) async {
    final res = await _dio.get<Map<String, dynamic>>('/orders/$orderId/track');
    return parseApiEnvelopeData(
      response: res,
      fromData: OrderTrackingModel.fromJson,
    );
  }
}

class OrdersListResult {
  const OrdersListResult({
    required this.items,
    required this.hasMore,
  });

  final List<Order> items;
  final bool hasMore;
}
