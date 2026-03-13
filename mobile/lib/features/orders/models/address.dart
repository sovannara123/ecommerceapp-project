class Address {
  const Address({
    required this.fullName,
    required this.phone,
    required this.line1,
    required this.city,
    required this.province,
    this.postalCode = '',
  });

  final String fullName;
  final String phone;
  final String line1;
  final String city;
  final String province;
  final String postalCode;

  factory Address.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return Address(
      fullName: (json['fullName'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      line1: (json['line1'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      province: (json['province'] ?? '').toString(),
      postalCode: (json['postalCode'] ?? '').toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'fullName': fullName,
        'phone': phone,
        'line1': line1,
        'city': city,
        'province': province,
        'postalCode': postalCode,
      };
}
