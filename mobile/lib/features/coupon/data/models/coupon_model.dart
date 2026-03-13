enum CouponType {
  percentage,
  fixed,
  unknown,
}

class CouponModel {
  const CouponModel({
    required this.code,
    required this.type,
    required this.value,
    required this.discount,
  });

  final String code;
  final CouponType type;
  final int value;
  final int discount;

  double get valueInDollars => value / 100;
  double get discountInDollars => discount / 100;

  factory CouponModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    final typeValue = (json['type'] ?? '').toString();

    return CouponModel(
      code: (json['code'] ?? '').toString(),
      type: CouponType.values.firstWhere(
        (e) => e.name == typeValue,
        orElse: () => CouponType.unknown,
      ),
      value: _toMoneyCents(json['value']),
      discount: _toMoneyCents(
        json['discountAmount'] ?? json['discount'] ?? json['couponDiscount'],
      ),
    );
  }

  Map<String, dynamic> toJson() => {
        'code': code,
        'type': type.name,
        'value': value,
        'discount': discount,
      };
}

int _toMoneyCents(dynamic raw) {
  return (raw is num) ? raw.round() : 0;
}
