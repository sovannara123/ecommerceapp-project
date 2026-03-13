import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../config/providers.dart';

final offlineQueueServiceProvider = Provider<OfflineQueueService>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return OfflineQueueService(prefs);
});

enum OfflineQueueAction {
  add,
  update,
  remove,
  clear,
}

class OfflineQueueItem {
  const OfflineQueueItem({
    required this.id,
    required this.action,
    required this.payload,
    required this.timestamp,
  });

  final String id;
  final OfflineQueueAction action;
  final Map<String, dynamic> payload;
  final DateTime timestamp;

  factory OfflineQueueItem.fromJson(Map<String, dynamic> json) {
    final actionValue = (json['action'] ?? '').toString();

    return OfflineQueueItem(
      id: (json['id'] ?? '').toString(),
      action: OfflineQueueAction.values.firstWhere(
        (value) => value.name == actionValue,
        orElse: () => OfflineQueueAction.clear,
      ),
      payload: _toMap(json['payload']),
      timestamp: DateTime.tryParse((json['timestamp'] ?? '').toString()) ??
          DateTime.fromMillisecondsSinceEpoch(0),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'action': action.name,
        'payload': payload,
        'timestamp': timestamp.toIso8601String(),
      };
}

class OfflineQueueService {
  OfflineQueueService(this._prefs);

  static const _queueKey = 'offline_cart_queue';
  static const _uuid = Uuid();

  final SharedPreferences _prefs;

  Future<void> addToQueue(
    OfflineQueueAction action,
    Map<String, dynamic> payload,
  ) async {
    final queue = getQueue();
    final item = OfflineQueueItem(
      id: _uuid.v4(),
      action: action,
      payload: payload,
      timestamp: DateTime.now(),
    );

    final nextQueue = [...queue, item];
    await _saveQueue(nextQueue);
  }

  List<OfflineQueueItem> getQueue() {
    final encoded = _prefs.getString(_queueKey);
    if (encoded == null || encoded.isEmpty) {
      return const <OfflineQueueItem>[];
    }

    try {
      final raw = jsonDecode(encoded);
      if (raw is! List) {
        return const <OfflineQueueItem>[];
      }

      final queue = raw
          .whereType<Map>()
          .map(
            (item) => OfflineQueueItem.fromJson(
              item.map((key, value) => MapEntry(key.toString(), value)),
            ),
          )
          .toList(growable: false);

      queue.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      return queue;
    } catch (_) {
      return const <OfflineQueueItem>[];
    }
  }

  Future<void> removeFromQueue(String id) async {
    final queue = getQueue();
    final nextQueue =
        queue.where((item) => item.id != id).toList(growable: false);
    await _saveQueue(nextQueue);
  }

  Future<void> clearQueue() async {
    await _prefs.remove(_queueKey);
  }

  Future<void> _saveQueue(List<OfflineQueueItem> items) async {
    final encoded =
        jsonEncode(items.map((item) => item.toJson()).toList(growable: false));
    await _prefs.setString(_queueKey, encoded);
  }
}

Map<String, dynamic> _toMap(dynamic raw) {
  if (raw is Map<String, dynamic>) return raw;
  if (raw is Map) {
    return raw.map((key, value) => MapEntry(key.toString(), value));
  }
  return <String, dynamic>{};
}
