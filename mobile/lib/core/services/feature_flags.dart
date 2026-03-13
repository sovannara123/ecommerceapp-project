import 'package:firebase_remote_config/firebase_remote_config.dart';

class FeatureFlags {
  FeatureFlags._();

  static FirebaseRemoteConfig get _remoteConfig =>
      FirebaseRemoteConfig.instance;

  static bool get socialLogin => _remoteConfig.getBool('enable_social_login');
}
