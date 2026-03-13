import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import 'feature_flags.dart';

class SocialAuthService {
  SocialAuthService._();

  static final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email']);

  static Future<Map<String, String>?> signInWithGoogle() async {
    if (!FeatureFlags.socialLogin) return null;
    final account = await _googleSignIn.signIn();
    if (account == null) return null;
    final auth = await account.authentication;
    return {
      'idToken': auth.idToken ?? '',
      'email': account.email,
      'displayName': account.displayName ?? '',
    };
  }

  static Future<Map<String, String>?> signInWithApple() async {
    if (!FeatureFlags.socialLogin) return null;
    final credential = await SignInWithApple.getAppleIDCredential(
      scopes: [
        AppleIDAuthorizationScopes.email,
        AppleIDAuthorizationScopes.fullName,
      ],
    );
    return {
      'identityToken': credential.identityToken ?? '',
      'email': credential.email ?? '',
      'givenName': credential.givenName ?? '',
    };
  }
}
