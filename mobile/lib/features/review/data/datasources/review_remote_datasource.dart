import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope_parser.dart';
import '../models/review_model.dart';

class ReviewRemoteDataSource {
  ReviewRemoteDataSource(this._dio);

  final Dio _dio;

  Future<ReviewModel> createReview({
    required String productId,
    required String orderId,
    required int rating,
    String comment = '',
    List<String> images = const <String>[],
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/reviews',
      data: {
        'productId': productId,
        'orderId': orderId,
        'rating': rating,
        'comment': comment,
        'images': images,
      },
    );

    return parseApiEnvelopeData(
      response: response,
      fromData: ReviewModel.fromJson,
    );
  }

  Future<ReviewModel> updateReview({
    required String reviewId,
    int? rating,
    String? comment,
    List<String>? images,
  }) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/reviews/$reviewId',
      data: {
        if (rating != null) 'rating': rating,
        if (comment != null) 'comment': comment,
        if (images != null) 'images': images,
      },
    );

    return parseApiEnvelopeData(
      response: response,
      fromData: ReviewModel.fromJson,
    );
  }

  Future<void> deleteReview(String reviewId) async {
    final response =
        await _dio.delete<Map<String, dynamic>>('/reviews/$reviewId');

    parseApiEnvelopeData<bool>(
      response: response,
      fromData: (raw) => raw == true,
    );
  }
}
