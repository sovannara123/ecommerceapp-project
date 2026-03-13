import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope_parser.dart';
import '../models/wishlist_item_model.dart';

class WishlistRemoteDataSource {
  WishlistRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<WishlistItemModel>> getWishlist() async {
    final response = await _dio.get<Map<String, dynamic>>('/wishlist');
    return parseApiEnvelopeData(response: response, fromData: _toWishlistList);
  }

  Future<List<WishlistItemModel>> addToWishlist(String productId) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/wishlist/add',
      data: {'productId': productId},
    );
    return parseApiEnvelopeData(response: response, fromData: _toWishlistList);
  }

  Future<List<WishlistItemModel>> removeFromWishlist(String productId) async {
    final response = await _dio.delete<Map<String, dynamic>>(
      '/wishlist/remove/$productId',
    );
    return parseApiEnvelopeData(response: response, fromData: _toWishlistList);
  }

  List<WishlistItemModel> _toWishlistList(Object? raw) {
    if (raw is! List) return const <WishlistItemModel>[];
    return raw.map(WishlistItemModel.fromJson).toList(growable: false);
  }
}
