import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_envelope_parser.dart';
import '../../../core/network/dio_provider.dart';
import '../models/payway_payment.dart';

final paymentsRepoProvider = Provider<PaymentsRepo>((ref) {
  return PaymentsRepo(ref.watch(dioProvider));
});

class PaymentsRepo {
  PaymentsRepo(this._dio);

  final Dio _dio;

  Future<PaywayPaymentResult> createPaywayPayment({
    required String orderId,
    required String paymentOption,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/payments/payway/create',
      data: {
        'orderId': orderId,
        'paymentOption': paymentOption,
      },
    );
    return parseApiEnvelopeData(response: res, fromData: PaywayPaymentResult.fromJson);
  }
}
