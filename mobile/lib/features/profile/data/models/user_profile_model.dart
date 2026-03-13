class UserProfileModel {
  const UserProfileModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.dateOfBirth,
    this.avatar,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final DateTime? dateOfBirth;
  final String? avatar;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory UserProfileModel.fromJson(dynamic raw) {
    final json = raw is Map<String, dynamic> ? raw : <String, dynamic>{};

    return UserProfileModel(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      role: (json['role'] ?? '').toString(),
      phone: _toNullableString(json['phone']),
      dateOfBirth: DateTime.tryParse((json['dateOfBirth'] ?? '').toString()),
      avatar: _toNullableString(json['avatar']),
      createdAt: DateTime.tryParse((json['createdAt'] ?? '').toString()),
      updatedAt: DateTime.tryParse((json['updatedAt'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'role': role,
        'phone': phone,
        'dateOfBirth': dateOfBirth?.toIso8601String(),
        'avatar': avatar,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };
}

String? _toNullableString(dynamic raw) {
  if (raw == null) return null;
  final value = raw.toString();
  return value.isEmpty ? null : value;
}
