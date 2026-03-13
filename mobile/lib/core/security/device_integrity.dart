import 'package:flutter/foundation.dart';
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';

class DeviceIntegrity {
  /// Returns true if device appears to be rooted/jailbroken.
  /// Returns false in debug mode to allow development on emulators.
  static Future<bool> isCompromised() async {
    if (kDebugMode) return false;

    try {
      final jailbroken = await FlutterJailbreakDetection.jailbroken;
      final developerMode = await FlutterJailbreakDetection.developerMode;
      return jailbroken || developerMode;
    } catch (e) {
      debugPrint('[DeviceIntegrity] Check failed: $e');
      // Fail open in case of detection errors —
      // change to `return true` for fail-closed if preferred
      return false;
    }
  }
}
