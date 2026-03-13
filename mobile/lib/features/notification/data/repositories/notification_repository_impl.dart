import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../../../core/utils/result.dart';
import '../datasources/notification_remote_datasource.dart';
import '../models/notification_model.dart';

final notificationRemoteDataSourceProvider =
    Provider<NotificationRemoteDataSource>((ref) {
  return NotificationRemoteDataSource(ref.watch(dioProvider));
});

final notificationRepositoryProvider =
    Provider<NotificationRepositoryImpl>((ref) {
  final remote = ref.watch(notificationRemoteDataSourceProvider);
  return NotificationRepositoryImpl(remote: remote, ref: ref);
});

class NotificationRepositoryImpl {
  NotificationRepositoryImpl({required this.remote, required this.ref});

  final NotificationRemoteDataSource remote;
  final Ref ref;

  Future<Result<NotificationPageModel>> getNotifications({int page = 1}) {
    return safeApiCall<NotificationPageModel>(
      ref,
      () => remote.getNotifications(page: page),
    );
  }

  Future<Result<NotificationModel>> markRead(String id) {
    return safeApiCall<NotificationModel>(
      ref,
      () => remote.markRead(id),
    );
  }

  Future<Result<void>> markAllRead() {
    return safeApiCall<void>(ref, remote.markAllRead);
  }

  Future<Result<void>> registerFcmToken(String token) {
    return safeApiCall<void>(
      ref,
      () => remote.registerFcmToken(token),
    );
  }
}
