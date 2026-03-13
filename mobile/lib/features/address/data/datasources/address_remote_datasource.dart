import 'package:dio/dio.dart';

import '../../../../core/network/api_envelope_parser.dart';
import '../models/address_model.dart';

class AddressRemoteDataSource {
  AddressRemoteDataSource(this._dio);

  final Dio _dio;

  Future<List<AddressModel>> getAddresses() async {
    final response = await _dio.get<Map<String, dynamic>>('/addresses');
    return parseApiEnvelopeData(response: response, fromData: _toAddressList);
  }

  Future<AddressModel> createAddress(Map<String, dynamic> payload) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/addresses',
      data: payload,
    );
    return parseApiEnvelopeData(
        response: response, fromData: AddressModel.fromJson);
  }

  Future<AddressModel> updateAddress(
    String addressId,
    Map<String, dynamic> payload,
  ) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/addresses/$addressId',
      data: payload,
    );
    return parseApiEnvelopeData(
        response: response, fromData: AddressModel.fromJson);
  }

  Future<void> deleteAddress(String addressId) async {
    final response =
        await _dio.delete<Map<String, dynamic>>('/addresses/$addressId');
    parseApiEnvelopeData<bool>(
      response: response,
      fromData: (raw) => raw == true,
    );
  }

  Future<AddressModel> setDefault(String addressId) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '/addresses/$addressId/set-default',
    );
    return parseApiEnvelopeData(
        response: response, fromData: AddressModel.fromJson);
  }

  List<AddressModel> _toAddressList(Object? raw) {
    if (raw is! List) return const <AddressModel>[];
    return raw.map(AddressModel.fromJson).toList(growable: false);
  }
}
