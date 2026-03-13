class WishlistItemModel {
  const WishlistItemModel({
    required this.productId,
    required this.name,
    required this.images,
    required this.price,
    required this.currency,
    required this.inStock,
    required this.stock,
    this.addedAt,
  });

  final String productId;
  final String name;
  final List<String> images;
  final int price;
  final String currency;
  final bool inStock;
  final int stock;
  final DateTime? addedAt;

  double get priceInDollars => price / 100;

  factory WishlistItemModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return WishlistItemModel(
      productId: (json['productId'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      images: _toStringList(json['images']),
      price: _toMoneyCents(json['price']),
      currency: (json['currency'] ?? 'USD').toString(),
      inStock: _toBool(json['inStock']),
      stock: _toInt(json['stock']),
      addedAt: DateTime.tryParse((json['addedAt'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'name': name,
        'images': images,
        'price': price,
        'currency': currency,
        'inStock': inStock,
        'stock': stock,
        'addedAt': addedAt?.toIso8601String(),
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

int _toMoneyCents(dynamic raw) {
  return (raw is num) ? raw.round() : 0;
}

bool _toBool(dynamic raw) {
  if (raw is bool) return raw;
  if (raw is num) return raw != 0;
  final value = (raw ?? '').toString().toLowerCase();
  return value == 'true' || value == '1';
}
