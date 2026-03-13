class OrderItem {
  const OrderItem({
    required this.productId,
    required this.title,
    required this.qty,
    required this.unitPrice,
    required this.lineTotal,
  });

  final String productId;
  final String title;
  final int qty;
  final double unitPrice;
  final double lineTotal;

  factory OrderItem.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return OrderItem(
      productId: (json['productId'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      qty: _toInt(json['qty']),
      unitPrice: _toDouble(json['unitPrice']),
      lineTotal: _toDouble(json['lineTotal']),
    );
  }
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
