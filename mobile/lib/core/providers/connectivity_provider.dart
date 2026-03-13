import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../network/connectivity_service.dart';

final connectivityProvider = StreamProvider<bool>((ref) async* {
  final service = ref.watch(connectivityServiceProvider);
  yield await service.isConnected;
  yield* service.connectivityStream;
});
