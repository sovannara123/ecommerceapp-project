import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../../orders/models/address.dart';
import '../../../orders/repositories/orders_repo.dart';
import '../../../payments/models/payway_payment.dart';
import '../../../payments/repositories/payments_repo.dart';
import '../../checkout_constants.dart';

enum CheckoutStep { address, shipping, payment, review }

@immutable
class CheckoutState {
  const CheckoutState({
    this.step = CheckoutStep.address,
    this.selectedAddressId,
    this.shippingMethodId,
    this.paymentMethodId = CheckoutConstants.paymentOptionAbaDeeplink,
    this.processing = false,
    this.createdOrderId,
    this.validationErrors = const {},
    this.error,
    this.paywayResult,
  });

  final CheckoutStep step;
  final String? selectedAddressId;
  final String? shippingMethodId;
  final String? paymentMethodId;
  final bool processing;
  final String? createdOrderId;

  /// Per-step validation errors; empty map = all valid.
  final Map<CheckoutStep, String> validationErrors;
  final String? error;

  // Keep existing integration for payway flow.
  final PaywayPaymentResult? paywayResult;

  bool get canAdvance => !validationErrors.containsKey(step);

  CheckoutState copyWith({
    CheckoutStep? step,
    String? selectedAddressId,
    String? shippingMethodId,
    String? paymentMethodId,
    bool? processing,
    String? createdOrderId,
    Map<CheckoutStep, String>? validationErrors,
    String? error,
    bool clearError = false,
    PaywayPaymentResult? paywayResult,
    bool clearPaywayResult = false,
  }) {
    return CheckoutState(
      step: step ?? this.step,
      selectedAddressId: selectedAddressId ?? this.selectedAddressId,
      shippingMethodId: shippingMethodId ?? this.shippingMethodId,
      paymentMethodId: paymentMethodId ?? this.paymentMethodId,
      processing: processing ?? this.processing,
      createdOrderId: createdOrderId ?? this.createdOrderId,
      validationErrors: validationErrors ?? this.validationErrors,
      error: clearError ? null : (error ?? this.error),
      paywayResult:
          clearPaywayResult ? null : (paywayResult ?? this.paywayResult),
    );
  }
}

final checkoutControllerProvider =
    NotifierProvider<CheckoutController, CheckoutState>(
  CheckoutController.new,
);

class CheckoutController extends Notifier<CheckoutState> {
  @override
  CheckoutState build() => const CheckoutState();

  void setPaymentOption(String paymentOption) {
    state = state.copyWith(paymentMethodId: paymentOption);
  }

  void goToStep(CheckoutStep step) {
    validate(state.step);
    if (!state.validationErrors.containsKey(state.step) ||
        step.index <= state.step.index) {
      state = state.copyWith(step: step);
    }
  }

  void nextStep() {
    validate(state.step);
    if (!state.canAdvance) return;
    if (state.step.index >= CheckoutStep.values.length - 1) return;
    state = state.copyWith(step: CheckoutStep.values[state.step.index + 1]);
  }

  void previousStep() {
    if (state.step.index <= 0) return;
    state = state.copyWith(step: CheckoutStep.values[state.step.index - 1]);
  }

  void validate(CheckoutStep step) {
    final nextErrors = Map<CheckoutStep, String>.from(state.validationErrors);

    switch (step) {
      case CheckoutStep.address:
        if ((state.selectedAddressId ?? '').isEmpty) {
          nextErrors[step] = 'Please select a delivery address.';
        } else {
          nextErrors.remove(step);
        }
      case CheckoutStep.shipping:
        if ((state.shippingMethodId ?? '').isEmpty) {
          nextErrors[step] = 'Please select a shipping method.';
        } else {
          nextErrors.remove(step);
        }
      case CheckoutStep.payment:
        if ((state.paymentMethodId ?? '').isEmpty) {
          nextErrors[step] = 'Please select a payment method.';
        } else {
          nextErrors.remove(step);
        }
      case CheckoutStep.review:
        nextErrors.remove(step);
    }

    state = state.copyWith(validationErrors: nextErrors);
  }

  Future<void> placeOrder({
    required String fullName,
    required String phone,
    required String line1,
    required String city,
    required String province,
  }) async {
    state = state.copyWith(
      processing: true,
      clearError: true,
      clearPaywayResult: true,
    );

    try {
      final order = await ref.read(ordersRepoProvider).createOrder(
            address: Address(
              fullName: fullName,
              phone: phone,
              line1: line1,
              city: city,
              province: province,
              postalCode: '',
            ),
            shippingFee: 0,
            currency: CheckoutConstants.currencyUsd,
            paymentProvider: CheckoutConstants.paymentProviderPayway,
            paymentOption: state.paymentMethodId ??
                CheckoutConstants.paymentOptionAbaDeeplink,
          );

      final payResult =
          await ref.read(paymentsRepoProvider).createPaywayPayment(
                orderId: order.id,
                paymentOption: state.paymentMethodId ??
                    CheckoutConstants.paymentOptionAbaDeeplink,
              );

      state = state.copyWith(
        processing: false,
        createdOrderId: order.id,
        paywayResult: payResult,
        step: CheckoutStep.review,
      );
    } catch (error) {
      final failure = ref.read(apiErrorMapperProvider).map(error);
      state = state.copyWith(
        processing: false,
        error: failure.message,
      );
    }
  }

  Future<void> pay({
    required String fullName,
    required String phone,
    required String line1,
    required String city,
    required String province,
  }) {
    return placeOrder(
      fullName: fullName,
      phone: phone,
      line1: line1,
      city: city,
      province: province,
    );
  }
}
