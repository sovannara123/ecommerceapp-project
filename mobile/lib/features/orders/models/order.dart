import 'address.dart';
import 'order_item.dart';

class Order {
  const Order({
    required this.id,
    required this.userId,
    required this.deviceId,
    required this.items,
    required this.subtotal,
    required this.shippingFee,
    required this.total,
    required this.currency,
    required this.status,
    required this.address,
    required this.paymentProvider,
    required this.paywayTranId,
    required this.paywayApv,
    this.createdAt,
  });

  final String id;
  final String userId;
  final String deviceId;
  final List<OrderItem> items;
  final double subtotal;
  final double shippingFee;
  final double total;
  final String currency;
  final String status;
  final Address address;
  final String paymentProvider;
  final String paywayTranId;
  final String paywayApv;
  final DateTime? createdAt;

  factory Order.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    final list = json['items'];

    return Order(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      userId: (json['userId'] ?? '').toString(),
      deviceId: (json['deviceId'] ?? '').toString(),
      items: list is List
          ? list.map(OrderItem.fromJson).toList(growable: false)
          : const <OrderItem>[],
      subtotal: _toDouble(json['subtotal']),
      shippingFee: _toDouble(json['shippingFee']),
      total: _toDouble(json['total']),
      currency: (json['currency'] ?? 'USD').toString(),
      status: (json['status'] ?? '').toString(),
      address: Address.fromJson(json['address']),
      paymentProvider: (json['paymentProvider'] ?? '').toString(),
      paywayTranId: (json['paywayTranId'] ?? '').toString(),
      paywayApv: (json['paywayApv'] ?? '').toString(),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
    );
  }
}

double _toDouble(dynamic raw) {
  if (raw is num) return raw.toDouble();
  return double.tryParse(raw?.toString() ?? '') ?? 0;
}
