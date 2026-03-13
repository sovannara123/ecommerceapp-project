class Product {
  const Product({
    required this.id,
    required this.title,
    required this.description,
    required this.images,
    required this.price,
    required this.currency,
    required this.categoryId,
    required this.stock,
    required this.tags,
    required this.rating,
    this.isFromCache = false,
  });

  final String id;
  final String title;
  final String description;
  final List<String> images;
  final double price;
  final String currency;
  final String categoryId;
  final int stock;
  final List<String> tags;
  final double rating;
  final bool isFromCache;

  factory Product.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return Product(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      description: (json['description'] ?? '').toString(),
      images: _toStringList(json['images']),
      price: _toDouble(json['price']),
      currency: (json['currency'] ?? 'USD').toString(),
      categoryId: (json['categoryId'] ?? '').toString(),
      stock: _toInt(json['stock']),
      tags: _toStringList(json['tags']),
      rating: _toDouble(json['rating']),
      isFromCache: _toBool(json['isFromCache']),
    );
  }

  Product copyWith({
    String? id,
    String? title,
    String? description,
    List<String>? images,
    double? price,
    String? currency,
    String? categoryId,
    int? stock,
    List<String>? tags,
    double? rating,
    bool? isFromCache,
  }) {
    return Product(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      images: images ?? this.images,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      categoryId: categoryId ?? this.categoryId,
      stock: stock ?? this.stock,
      tags: tags ?? this.tags,
      rating: rating ?? this.rating,
      isFromCache: isFromCache ?? this.isFromCache,
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'id': id,
        'title': title,
        'description': description,
        'images': images,
        'price': price,
        'currency': currency,
        'categoryId': categoryId,
        'stock': stock,
        'tags': tags,
        'rating': rating,
      };
}

class ProductPage {
  const ProductPage({
    required this.items,
    required this.nextCursor,
    this.isFromCache = false,
  });

  final List<Product> items;
  final String? nextCursor;
  final bool isFromCache;

  factory ProductPage.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    final list = json['items'];
    final items = list is List
        ? list.map(Product.fromJson).toList(growable: false)
        : const <Product>[];

    final nextCursorRaw = json['nextCursor'];
    final nextCursor =
        (nextCursorRaw == null || nextCursorRaw.toString().isEmpty)
            ? null
            : nextCursorRaw.toString();

    return ProductPage(
      items: items,
      nextCursor: nextCursor,
      isFromCache: false,
    );
  }
}

List<String> _toStringList(dynamic raw) {
  if (raw is List) {
    return raw.map((item) => item.toString()).toList(growable: false);
  }
  return const <String>[];
}

double _toDouble(dynamic raw) {
  if (raw is num) return raw.toDouble();
  return double.tryParse(raw?.toString() ?? '') ?? 0;
}

int _toInt(dynamic raw) {
  if (raw is int) return raw;
  if (raw is num) return raw.toInt();
  return int.tryParse(raw?.toString() ?? '') ?? 0;
}

bool _toBool(dynamic raw) {
  if (raw is bool) return raw;
  if (raw is num) return raw != 0;
  final value = (raw ?? '').toString().toLowerCase();
  return value == 'true' || value == '1';
}
