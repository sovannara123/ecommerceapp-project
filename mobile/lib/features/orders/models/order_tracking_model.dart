class OrderTrackingModel {
  const OrderTrackingModel({
    required this.statusHistory,
    this.trackingNumber,
  });

  final List<OrderTrackingHistoryItem> statusHistory;
  final String? trackingNumber;

  factory OrderTrackingModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    final historyRaw = json['statusHistory'];

    return OrderTrackingModel(
      statusHistory: historyRaw is List
          ? historyRaw
              .map(OrderTrackingHistoryItem.fromJson)
              .toList(growable: false)
          : const <OrderTrackingHistoryItem>[],
      trackingNumber: _toNullableString(json['trackingNumber']),
    );
  }

  Map<String, dynamic> toJson() => {
        'statusHistory': statusHistory.map((item) => item.toJson()).toList(),
        'trackingNumber': trackingNumber,
      };
}

class OrderTrackingHistoryItem {
  const OrderTrackingHistoryItem({
    required this.status,
    this.timestamp,
    required this.note,
  });

  final String status;
  final DateTime? timestamp;
  final String note;

  factory OrderTrackingHistoryItem.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return OrderTrackingHistoryItem(
      status: (json['status'] ?? '').toString(),
      timestamp: DateTime.tryParse((json['timestamp'] ?? '').toString()),
      note: (json['note'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'status': status,
        'timestamp': timestamp?.toIso8601String(),
        'note': note,
      };
}

String? _toNullableString(dynamic raw) {
  if (raw == null) return null;
  final value = raw.toString();
  return value.isEmpty ? null : value;
}
