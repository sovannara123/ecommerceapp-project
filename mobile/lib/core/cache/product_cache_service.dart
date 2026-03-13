import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/providers.dart';
import '../../features/catalog/models/product.dart';

final productCacheServiceProvider = Provider<ProductCacheService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ProductCacheService(prefs);
});

class ProductCacheService {
  ProductCacheService(this._prefs);

  static const _productsCacheKey = 'cache_products';
  static const _productDetailPrefix = 'cache_product_detail_';
  static const _cacheTimestampKey = 'cache_products_updated_at';

  final SharedPreferences _prefs;

  Future<void> cacheProducts(List<Product> products) async {
    final jsonList =
        products.map((product) => product.toJson()).toList(growable: false);
    final encoded = jsonEncode(jsonList);
    await _prefs.setString(_productsCacheKey, encoded);
    await _prefs.setInt(
        _cacheTimestampKey, DateTime.now().millisecondsSinceEpoch);
  }

  List<Product> getCachedProducts() {
    final encoded = _prefs.getString(_productsCacheKey);
    if (encoded == null || encoded.isEmpty) {
      return const <Product>[];
    }

    try {
      final raw = jsonDecode(encoded);
      if (raw is! List) {
        return const <Product>[];
      }

      return raw
          .whereType<Map>()
          .map(
            (item) => Product.fromJson(
              item.map((key, value) => MapEntry(key.toString(), value)),
            ).copyWith(isFromCache: true),
          )
          .toList(growable: false);
    } catch (_) {
      return const <Product>[];
    }
  }

  Future<void> cacheProductDetail(Product product) async {
    final key = '$_productDetailPrefix${product.id}';
    final encoded = jsonEncode(product.toJson());
    await _prefs.setString(key, encoded);
    await _prefs.setInt(
        _cacheTimestampKey, DateTime.now().millisecondsSinceEpoch);
  }

  Product? getCachedProduct(String id) {
    final key = '$_productDetailPrefix$id';
    final encoded = _prefs.getString(key);
    if (encoded == null || encoded.isEmpty) {
      return null;
    }

    try {
      final raw = jsonDecode(encoded);
      if (raw is! Map) {
        return null;
      }
      return Product.fromJson(
        raw.map((key, value) => MapEntry(key.toString(), value)),
      ).copyWith(isFromCache: true);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearCache() async {
    final keys = _prefs.getKeys();
    final futures = <Future<bool>>[];

    for (final key in keys) {
      if (key == _productsCacheKey ||
          key == _cacheTimestampKey ||
          key.startsWith(_productDetailPrefix)) {
        futures.add(_prefs.remove(key));
      }
    }

    if (futures.isNotEmpty) {
      await Future.wait(futures);
    }
  }

  DateTime? getCacheAge() {
    final timestamp = _prefs.getInt(_cacheTimestampKey);
    if (timestamp == null) {
      return null;
    }
    return DateTime.fromMillisecondsSinceEpoch(timestamp);
  }
}
