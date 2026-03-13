import 'package:dio/dio.dart';

/// Caches successful GET responses in memory for a limited duration.
class CacheInterceptor extends Interceptor {
  /// Creates an in-memory cache interceptor with [maxAge] TTL per entry.
  CacheInterceptor({
    this.maxAge = const Duration(minutes: 5),
  });

  final Duration maxAge;
  final Map<String, _CacheEntry> _cache = {};

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (options.method.toUpperCase() != 'GET') {
      handler.next(options);
      return;
    }

    final key = options.uri.toString();
    final cached = _cache[key];
    if (cached == null || cached.expiry.isBefore(DateTime.now())) {
      if (cached != null) {
        _cache.remove(key);
      }
      handler.next(options);
      return;
    }

    handler.resolve(
      Response<dynamic>(
        requestOptions: options,
        data: cached.response.data,
        headers: cached.response.headers,
        isRedirect: cached.response.isRedirect,
        redirects: cached.response.redirects,
        statusCode: cached.response.statusCode,
        statusMessage: 'FROM_CACHE',
        extra: Map<String, dynamic>.from(cached.response.extra),
      ),
    );
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    final method = response.requestOptions.method.toUpperCase();
    if (method == 'GET' && response.statusCode == 200) {
      final key = response.requestOptions.uri.toString();
      _cache[key] = _CacheEntry(
        response: response,
        expiry: DateTime.now().add(maxAge),
      );
    }

    handler.next(response);
  }

  /// Clears all cached responses.
  void clearCache() {
    _cache.clear();
  }

  /// Removes a cached response entry by absolute URL string.
  void removeCacheFor(String url) {
    _cache.remove(url);
  }
}

class _CacheEntry {
  const _CacheEntry({
    required this.response,
    required this.expiry,
  });

  final Response response;
  final DateTime expiry;
}
