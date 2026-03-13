class AddressModel {
  const AddressModel({
    required this.id,
    required this.userId,
    required this.label,
    required this.fullName,
    required this.phone,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    required this.state,
    required this.postalCode,
    required this.country,
    required this.isDefault,
    this.location,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String label;
  final String fullName;
  final String phone;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final bool isDefault;
  final AddressLocationModel? location;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory AddressModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    final locationRaw = json['location'];

    return AddressModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      userId: (json['userId'] ?? '').toString(),
      label: (json['label'] ?? 'home').toString(),
      fullName: (json['fullName'] ?? '').toString(),
      phone: (json['phone'] ?? '').toString(),
      addressLine1: (json['addressLine1'] ?? '').toString(),
      addressLine2: _toNullableString(json['addressLine2']),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      postalCode: (json['postalCode'] ?? '').toString(),
      country: (json['country'] ?? 'KH').toString(),
      isDefault: _toBool(json['isDefault']),
      location: locationRaw is Map<String, dynamic>
          ? AddressLocationModel.fromJson(locationRaw)
          : null,
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      updatedAt: DateTime.tryParse((json['updatedAt'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        '_id': id,
        'id': id,
        'userId': userId,
        'label': label,
        'fullName': fullName,
        'phone': phone,
        'addressLine1': addressLine1,
        'addressLine2': addressLine2,
        'city': city,
        'state': state,
        'postalCode': postalCode,
        'country': country,
        'isDefault': isDefault,
        'location': location?.toJson(),
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  Map<String, dynamic> toRequestJson() => {
        'label': label,
        'fullName': fullName,
        'phone': phone,
        'addressLine1': addressLine1,
        'addressLine2': addressLine2,
        'city': city,
        'state': state,
        'postalCode': postalCode,
        'country': country,
        'isDefault': isDefault,
        'location': location?.toJson(),
      };
}

class AddressLocationModel {
  const AddressLocationModel({
    required this.lat,
    required this.lng,
  });

  final double lat;
  final double lng;

  factory AddressLocationModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};
    return AddressLocationModel(
      lat: _toDouble(json['lat']),
      lng: _toDouble(json['lng']),
    );
  }

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'lng': lng,
      };
}

String? _toNullableString(dynamic raw) {
  if (raw == null) return null;
  final value = raw.toString();
  return value.isEmpty ? null : value;
}

bool _toBool(dynamic raw) {
  if (raw is bool) return raw;
  if (raw is num) return raw != 0;
  final value = (raw ?? '').toString().toLowerCase();
  return value == 'true' || value == '1';
}

double _toDouble(dynamic raw) {
  if (raw is num) return raw.toDouble();
  return double.tryParse(raw?.toString() ?? '') ?? 0;
}
