import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../../../core/utils/result.dart';
import '../datasources/address_remote_datasource.dart';
import '../models/address_model.dart';

final addressRemoteDataSourceProvider =
    Provider<AddressRemoteDataSource>((ref) {
  return AddressRemoteDataSource(ref.watch(dioProvider));
});

final addressRepositoryProvider = Provider<AddressRepositoryImpl>((ref) {
  final remote = ref.watch(addressRemoteDataSourceProvider);
  return AddressRepositoryImpl(remote: remote, ref: ref);
});

class AddressRepositoryImpl {
  AddressRepositoryImpl({required this.remote, required this.ref});

  final AddressRemoteDataSource remote;
  final Ref ref;

  Future<Result<List<AddressModel>>> getAddresses() {
    return safeApiCall<List<AddressModel>>(ref, remote.getAddresses);
  }

  Future<Result<AddressModel>> createAddress(AddressModel address) {
    return safeApiCall<AddressModel>(
      ref,
      () => remote.createAddress(address.toRequestJson()),
    );
  }

  Future<Result<AddressModel>> updateAddress(
    String addressId,
    Map<String, dynamic> payload,
  ) {
    return safeApiCall<AddressModel>(
      ref,
      () => remote.updateAddress(addressId, payload),
    );
  }

  Future<Result<void>> deleteAddress(String addressId) {
    return safeApiCall<void>(
      ref,
      () => remote.deleteAddress(addressId),
    );
  }

  Future<Result<AddressModel>> setDefault(String addressId) {
    return safeApiCall<AddressModel>(
      ref,
      () => remote.setDefault(addressId),
    );
  }
}
