import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/cache/product_cache_service.dart';
import '../../../core/network/api_envelope_parser.dart';
import '../../../core/network/dio_provider.dart';
import '../models/category.dart';
import '../models/product.dart';

final catalogRepoProvider = Provider<CatalogRepo>((ref) {
  return CatalogRepo(
    ref.watch(dioProvider),
    ref.watch(productCacheServiceProvider),
  );
});

class CatalogRepo {
  CatalogRepo(this._dio, this._cache);

  final Dio _dio;
  final ProductCacheService _cache;

  Future<ProductPage> listProducts({
    int limit = 20,
    String? cursor,
    String? query,
    String? categoryId,
  }) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>(
        '/catalog/products',
        queryParameters: {
          'limit': limit,
          if (cursor != null && cursor.isNotEmpty) 'cursor': cursor,
          if (query != null && query.isNotEmpty) 'q': query,
          if (categoryId != null && categoryId.isNotEmpty)
            'categoryId': categoryId,
        },
      );

      final page = parseApiEnvelopeData(
        response: res,
        fromData: ProductPage.fromJson,
      );

      final mergedItems = await _mergeWithExistingCache(page.items);
      await _cache.cacheProducts(mergedItems);

      return ProductPage(
        items: page.items,
        nextCursor: page.nextCursor,
        isFromCache: false,
      );
    } catch (error) {
      if (!_isNetworkFailure(error)) {
        rethrow;
      }

      final cached = _cache.getCachedProducts();
      if (cached.isEmpty) {
        rethrow;
      }

      return ProductPage(
        items: cached,
        nextCursor: null,
        isFromCache: true,
      );
    }
  }

  Future<Product> getProduct(String id) async {
    try {
      final res = await _dio.get<Map<String, dynamic>>('/catalog/products/$id');
      final product =
          parseApiEnvelopeData(response: res, fromData: Product.fromJson);
      await _cache.cacheProductDetail(product);
      return product.copyWith(isFromCache: false);
    } catch (error) {
      if (!_isNetworkFailure(error)) {
        rethrow;
      }

      final cached = _cache.getCachedProduct(id);
      if (cached == null) {
        rethrow;
      }
      return cached.copyWith(isFromCache: true);
    }
  }

  Future<List<Category>> listCategories() async {
    final res = await _dio.get<Map<String, dynamic>>('/catalog/categories');
    return parseApiEnvelopeData(
        response: res,
        fromData: (data) {
          if (data is! List) {
            return const <Category>[];
          }
          return data.map(Category.fromJson).toList(growable: false);
        });
  }

  Future<List<Product>> _mergeWithExistingCache(List<Product> products) async {
    final byId = <String, Product>{};

    for (final product in _cache.getCachedProducts()) {
      byId[product.id] = product.copyWith(isFromCache: false);
    }
    for (final product in products) {
      byId[product.id] = product.copyWith(isFromCache: false);
    }

    return byId.values.toList(growable: false);
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
