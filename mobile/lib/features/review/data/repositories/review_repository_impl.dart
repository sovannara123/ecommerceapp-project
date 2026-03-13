import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../../../core/utils/result.dart';
import '../datasources/review_remote_datasource.dart';
import '../models/review_model.dart';

final reviewRemoteDataSourceProvider = Provider<ReviewRemoteDataSource>((ref) {
  return ReviewRemoteDataSource(ref.watch(dioProvider));
});

final reviewRepositoryProvider = Provider<ReviewRepositoryImpl>((ref) {
  final remote = ref.watch(reviewRemoteDataSourceProvider);
  return ReviewRepositoryImpl(remote: remote, ref: ref);
});

class ReviewRepositoryImpl {
  ReviewRepositoryImpl({required this.remote, required this.ref});

  final ReviewRemoteDataSource remote;
  final Ref ref;

  Future<Result<ReviewModel>> createReview({
    required String productId,
    required String orderId,
    required int rating,
    String comment = '',
    List<String> images = const <String>[],
  }) {
    return safeApiCall<ReviewModel>(
      ref,
      () => remote.createReview(
        productId: productId,
        orderId: orderId,
        rating: rating,
        comment: comment,
        images: images,
      ),
    );
  }

  Future<Result<ReviewModel>> updateReview({
    required String reviewId,
    int? rating,
    String? comment,
    List<String>? images,
  }) {
    return safeApiCall<ReviewModel>(
      ref,
      () => remote.updateReview(
        reviewId: reviewId,
        rating: rating,
        comment: comment,
        images: images,
      ),
    );
  }

  Future<Result<void>> deleteReview(String reviewId) {
    return safeApiCall<void>(
      ref,
      () => remote.deleteReview(reviewId),
    );
  }
}
