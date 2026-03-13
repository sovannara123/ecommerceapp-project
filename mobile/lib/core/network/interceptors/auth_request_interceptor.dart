import 'package:dio/dio.dart';

import '../auth_session_coordinator.dart';
import '../../storage/device_id_store.dart';

class AuthRequestInterceptor extends Interceptor {
  AuthRequestInterceptor({
    required this.session,
    required this.deviceIdStore,
  });

  final AuthSessionCoordinator session;
  final DeviceIdStore deviceIdStore;

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final deviceId = await deviceIdStore.getOrCreate();
    options.headers['x-device-id'] = deviceId;

    final token = session.accessToken;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    super.onRequest(options, handler);
  }
}
