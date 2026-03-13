import 'package:flutter/foundation.dart';

@immutable
class AuthSession {
  const AuthSession({
    required this.initialized,
    required this.isAuthenticated,
    this.accessToken,
    this.refreshToken,
    this.userEmail,
    this.userName,
    this.userRole,
  });

  final bool initialized;
  final bool isAuthenticated;
  final String? accessToken;
  final String? refreshToken;
  final String? userEmail;
  final String? userName;
  final String? userRole;

  const AuthSession.unknown()
      : initialized = false,
        isAuthenticated = false,
        accessToken = null,
        refreshToken = null,
        userEmail = null,
        userName = null,
        userRole = null;

  AuthSession copyWith({
    bool? initialized,
    bool? isAuthenticated,
    String? accessToken,
    String? refreshToken,
    String? userEmail,
    String? userName,
    String? userRole,
  }) {
    return AuthSession(
      initialized: initialized ?? this.initialized,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      userEmail: userEmail ?? this.userEmail,
      userName: userName ?? this.userName,
      userRole: userRole ?? this.userRole,
    );
  }
}
