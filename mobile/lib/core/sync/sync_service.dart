import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../cache/offline_queue_service.dart';
import '../network/connectivity_service.dart';
import '../network/dio_provider.dart';

enum SyncStatus {
  idle,
  syncing,
  error,
  complete,
}

final syncServiceProvider = Provider<SyncService>((ref) {
  final service = SyncService(
    queueService: ref.watch(offlineQueueServiceProvider),
    connectivityService: ref.watch(connectivityServiceProvider),
    dio: ref.watch(dioProvider),
  );

  service.start();
  ref.onDispose(service.dispose);
  return service;
});

class SyncService {
  SyncService({
    required OfflineQueueService queueService,
    required ConnectivityService connectivityService,
    required Dio dio,
  })  : _queueService = queueService,
        _connectivityService = connectivityService,
        _dio = dio;

  final OfflineQueueService _queueService;
  final ConnectivityService _connectivityService;
  final Dio _dio;

  final StreamController<SyncStatus> _syncStatusController =
      StreamController<SyncStatus>.broadcast();

  StreamSubscription<bool>? _connectivitySubscription;
  bool _started = false;
  bool _isSyncing = false;

  Stream<SyncStatus> get syncStatus => _syncStatusController.stream;

  void start() {
    if (_started) return;
    _started = true;
    _syncStatusController.add(SyncStatus.idle);

    _connectivitySubscription =
        _connectivityService.connectivityStream.listen((connected) {
      if (connected) {
        unawaited(syncPendingOperations());
      }
    });

    unawaited(_initialSyncIfNeeded());
  }

  Future<void> syncPendingOperations() async {
    if (_isSyncing) return;

    final queue = _queueService.getQueue();
    if (queue.isEmpty) {
      _syncStatusController.add(SyncStatus.complete);
      return;
    }

    final connected = await _connectivityService.isConnected;
    if (!connected) {
      _syncStatusController.add(SyncStatus.idle);
      return;
    }

    _isSyncing = true;
    _syncStatusController.add(SyncStatus.syncing);

    var hadError = false;

    for (final item in queue) {
      try {
        await _performOperation(item);
        await _queueService.removeFromQueue(item.id);
      } on DioException catch (error) {
        if (error.response?.statusCode == 404) {
          await _queueService.removeFromQueue(item.id);
          continue;
        }
        hadError = true;
        break;
      } catch (_) {
        hadError = true;
        break;
      }
    }

    _isSyncing = false;
    _syncStatusController
        .add(hadError ? SyncStatus.error : SyncStatus.complete);
  }

  Future<void> dispose() async {
    await _connectivitySubscription?.cancel();
    await _syncStatusController.close();
  }

  Future<void> _initialSyncIfNeeded() async {
    final connected = await _connectivityService.isConnected;
    if (!connected) return;

    if (_queueService.getQueue().isNotEmpty) {
      await syncPendingOperations();
    }
  }

  Future<void> _performOperation(OfflineQueueItem item) {
    switch (item.action) {
      case OfflineQueueAction.add:
        return _dio.post<Map<String, dynamic>>('/cart/add', data: item.payload);
      case OfflineQueueAction.update:
        return _dio.post<Map<String, dynamic>>('/cart/update',
            data: item.payload);
      case OfflineQueueAction.remove:
        return _dio.post<Map<String, dynamic>>('/cart/remove',
            data: item.payload);
      case OfflineQueueAction.clear:
        return _dio.post<Map<String, dynamic>>('/cart/clear');
    }
  }
}
