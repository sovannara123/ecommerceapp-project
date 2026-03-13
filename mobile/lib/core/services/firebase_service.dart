import 'dart:async';
import 'dart:ui';

import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_performance/firebase_performance.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:flutter/foundation.dart';

class FirebaseService {
  static final FirebaseAnalytics analytics = FirebaseAnalytics.instance;
  static final FirebaseAnalyticsObserver observer =
      FirebaseAnalyticsObserver(analytics: analytics);

  static Future<void> initialize() async {
    await Firebase.initializeApp();

    // Crashlytics
    FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
    await FirebaseCrashlytics.instance
        .setCrashlyticsCollectionEnabled(!kDebugMode);

    // Performance
    await FirebasePerformance.instance
        .setPerformanceCollectionEnabled(!kDebugMode);

    // Remote Config
    final remoteConfig = FirebaseRemoteConfig.instance;
    await remoteConfig.setConfigSettings(
      RemoteConfigSettings(
        fetchTimeout: const Duration(minutes: 1),
        minimumFetchInterval:
            kDebugMode ? const Duration(minutes: 5) : const Duration(hours: 1),
      ),
    );
    await remoteConfig.setDefaults(<String, dynamic>{
      'force_update_current_version': '1.0.0',
      'force_update_enabled': false,
      'maintenance_mode': false,
      'maintenance_message': 'We are performing scheduled maintenance.',
      'enable_social_login': false,
      'enable_referral_program': true,
      'enable_loyalty_points': true,
      'min_order_amount': 0,
      'rate_review_prompt_order_count': 3,
    });
    await remoteConfig.fetchAndActivate();

    // Analytics
    await analytics.logAppOpen();
  }

  static Future<void> initMessaging() async {
    final messaging = FirebaseMessaging.instance;
    final settings = await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      final token = await messaging.getToken();
      // TODO: send token to backend POST /api/users/fcm-token
      debugPrint('FCM Token: $token');
    }
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  @pragma('vm:entry-point')
  static Future<void> _firebaseMessagingBackgroundHandler(
    RemoteMessage message,
  ) async {
    await Firebase.initializeApp();
    // handle background message
  }
}
