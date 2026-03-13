import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_models.freezed.dart';
part 'auth_models.g.dart';

@freezed
class AuthUserDto with _$AuthUserDto {
  const factory AuthUserDto({
    required String id,
    required String name,
    required String email,
    required String role,
  }) = _AuthUserDto;

  factory AuthUserDto.fromJson(Map<String, dynamic> json) => _$AuthUserDtoFromJson(json);
}

@freezed
class LoginResponseDto with _$LoginResponseDto {
  const factory LoginResponseDto({
    required AuthUserDto user,
    required String accessToken,
    required String refreshToken,
    required DateTime expiresAt,
  }) = _LoginResponseDto;

  factory LoginResponseDto.fromJson(Map<String, dynamic> json) => _$LoginResponseDtoFromJson(json);
}

@freezed
class RefreshResponseDto with _$RefreshResponseDto {
  const factory RefreshResponseDto({
    required String accessToken,
    required String refreshToken,
    required DateTime expiresAt,
  }) = _RefreshResponseDto;

  factory RefreshResponseDto.fromJson(Map<String, dynamic> json) => _$RefreshResponseDtoFromJson(json);
}
