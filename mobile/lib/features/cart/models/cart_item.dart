class CartItem {
  const CartItem({
    required this.productId,
    required this.qty,
    required this.priceSnapshot,
  });

  final String productId;
  final int qty;
  final double priceSnapshot;

  factory CartItem.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return CartItem(
      productId: (json['productId'] ?? '').toString(),
      qty: _toInt(json['qty']),
      priceSnapshot: _toDouble(json['priceSnapshot']),
    );
  }

  CartItem copyWith({
    String? productId,
    int? qty,
    double? priceSnapshot,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      qty: qty ?? this.qty,
      priceSnapshot: priceSnapshot ?? this.priceSnapshot,
    );
  }

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'qty': qty,
        'priceSnapshot': priceSnapshot,
      };
}

int _toInt(dynamic raw) {
  if (raw is int) return raw;
  if (raw is num) return raw.toInt();
  return int.tryParse(raw?.toString() ?? '') ?? 0;
}

double _toDouble(dynamic raw) {
  if (raw is num) return raw.toDouble();
  return double.tryParse(raw?.toString() ?? '') ?? 0;
}
