import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return ConnectivityService();
});

class ConnectivityService {
  ConnectivityService({Connectivity? connectivity})
      : _connectivity = connectivity ?? Connectivity();

  final Connectivity _connectivity;

  Stream<bool> get connectivityStream {
    return _connectivity.onConnectivityChanged.map(_isOnlineResult).distinct();
  }

  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return _isOnlineResult(result);
  }

  bool _isOnlineResult(dynamic result) {
    return switch (result) {
      ConnectivityResult r => r != ConnectivityResult.none,
      List<ConnectivityResult> results =>
        results.any((value) => value != ConnectivityResult.none),
      _ => true,
    };
  }
}
