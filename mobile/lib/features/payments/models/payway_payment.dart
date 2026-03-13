class PaywayPaymentResult {
  const PaywayPaymentResult({
    required this.provider,
    required this.mode,
    required this.tranId,
    this.qrString,
    this.deeplink,
    this.checkoutHtml,
  });

  final String provider;
  final String mode;
  final String tranId;
  final String? qrString;
  final String? deeplink;
  final String? checkoutHtml;

  bool get isDeepLink => mode == 'deeplink';
  bool get isWeb => mode == 'web';

  factory PaywayPaymentResult.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return PaywayPaymentResult(
      provider: (json['provider'] ?? '').toString(),
      mode: (json['mode'] ?? '').toString(),
      tranId: (json['tranId'] ?? '').toString(),
      qrString: _toNullable(json['qrString']),
      deeplink: _toNullable(json['deeplink']),
      checkoutHtml: _toNullable(json['checkoutHtml']),
    );
  }
}

class PaywayWebViewArgs {
  const PaywayWebViewArgs({
    required this.orderId,
    required this.html,
  });

  final String orderId;
  final String html;
}

String? _toNullable(dynamic value) {
  if (value == null) return null;
  final out = value.toString();
  return out.isEmpty ? null : out;
}
