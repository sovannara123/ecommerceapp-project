import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../constants/app_constants.dart';

class DeviceIdStore {
  DeviceIdStore(this._preferences, {Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  final SharedPreferences _preferences;
  final Uuid _uuid;

  Future<String> getOrCreate() async {
    final existing = _preferences.getString(AppConstants.prefsDeviceIdKey);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }

    final next = 'flutter-${_uuid.v4()}';
    await _preferences.setString(AppConstants.prefsDeviceIdKey, next);
    return next;
  }
}
