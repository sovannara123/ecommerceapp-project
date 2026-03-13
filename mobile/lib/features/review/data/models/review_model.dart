class ReviewModel {
  const ReviewModel({
    required this.id,
    required this.userId,
    required this.productId,
    required this.orderId,
    required this.rating,
    required this.comment,
    required this.images,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String productId;
  final String orderId;
  final int rating;
  final String comment;
  final List<String> images;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory ReviewModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return ReviewModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      userId: (json['userId'] ?? '').toString(),
      productId: (json['productId'] ?? '').toString(),
      orderId: (json['orderId'] ?? '').toString(),
      rating: _toInt(json['rating']),
      comment: (json['comment'] ?? '').toString(),
      images: _toStringList(json['images']),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      updatedAt: DateTime.tryParse((json['updatedAt'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'id': id,
        'userId': userId,
        'productId': productId,
        'orderId': orderId,
        'rating': rating,
        'comment': comment,
        'images': images,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  Map<String, dynamic> toCreateJson() => {
        'productId': productId,
        'orderId': orderId,
        'rating': rating,
        'comment': comment,
        'images': images,
      };

  Map<String, dynamic> toUpdateJson() => {
        'rating': rating,
        'comment': comment,
        'images': images,
      };
}

List<String> _toStringList(dynamic raw) {
  if (raw is List) {
    return raw.map((item) => item.toString()).toList(growable: false);
  }
  return const <String>[];
}

int _toInt(dynamic raw) {
  if (raw is int) return raw;
  if (raw is num) return raw.toInt();
  return int.tryParse(raw?.toString() ?? '') ?? 0;
}
