import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../../../core/utils/result.dart';
import '../datasources/wishlist_remote_datasource.dart';
import '../models/wishlist_item_model.dart';

final wishlistRemoteDataSourceProvider =
    Provider<WishlistRemoteDataSource>((ref) {
  return WishlistRemoteDataSource(ref.watch(dioProvider));
});

final wishlistRepositoryProvider = Provider<WishlistRepositoryImpl>((ref) {
  final remote = ref.watch(wishlistRemoteDataSourceProvider);
  return WishlistRepositoryImpl(remote: remote, ref: ref);
});

class WishlistRepositoryImpl {
  WishlistRepositoryImpl({required this.remote, required this.ref});

  final WishlistRemoteDataSource remote;
  final Ref ref;

  Future<Result<List<WishlistItemModel>>> getWishlist() {
    return safeApiCall<List<WishlistItemModel>>(ref, remote.getWishlist);
  }

  Future<Result<List<WishlistItemModel>>> addToWishlist(String productId) {
    return safeApiCall<List<WishlistItemModel>>(
      ref,
      () => remote.addToWishlist(productId),
    );
  }

  Future<Result<List<WishlistItemModel>>> removeFromWishlist(String productId) {
    return safeApiCall<List<WishlistItemModel>>(
      ref,
      () => remote.removeFromWishlist(productId),
    );
  }
}
