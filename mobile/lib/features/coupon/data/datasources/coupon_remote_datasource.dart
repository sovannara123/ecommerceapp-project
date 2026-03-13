import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope_parser.dart';
import '../models/coupon_model.dart';

class CouponRemoteDataSource {
  CouponRemoteDataSource(this._dio);

  final Dio _dio;

  Future<CouponModel> validateCoupon({
    required String code,
    required double cartTotal,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/coupons/validate',
      data: {
        'code': code,
        'cartTotal': cartTotal,
      },
    );

    return parseApiEnvelopeData(
      response: response,
      fromData: CouponModel.fromJson,
    );
  }

  Future<CouponModel> applyCoupon({
    required String code,
    required String orderId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/coupons/apply',
      data: {
        'code': code,
        'orderId': orderId,
      },
    );

    return parseApiEnvelopeData(
      response: response,
      fromData: (raw) {
        final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
        return CouponModel.fromJson(
          {
            'code': json['code'],
            'type': json['type'],
            'value': json['value'],
            'discount': json['discountAmount'] ?? json['couponDiscount'],
          },
        );
      },
    );
  }
}
