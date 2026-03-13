import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ecommerce_mobile/app/router/app_routes.dart';
import 'package:ecommerce_mobile/features/checkout/checkout_constants.dart';
import 'package:ecommerce_mobile/features/checkout/presentation/controllers/checkout_controller.dart';
import 'package:ecommerce_mobile/features/payments/models/payway_payment.dart';
import 'package:ecommerce_mobile/shared/widgets/keyboard_dismiss_wrapper.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _formKey = GlobalKey<FormState>();
  final _fullName = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _line1 = TextEditingController();
  final _city = TextEditingController();
  final _province = TextEditingController();

  @override
  void dispose() {
    _fullName.dispose();
    _phone.dispose();
    _email.dispose();
    _line1.dispose();
    _city.dispose();
    _province.dispose();
    super.dispose();
  }

  String? _requiredValidator(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'This field is required';
    }
    return null;
  }

  String? _phoneValidator(String? value) {
    if (value == null || value.trim().isEmpty) return 'Phone is required';
    if (!RegExp(r'^\+?[0-9]{7,15}$').hasMatch(value.trim())) {
      return 'Enter a valid phone number';
    }
    return null;
  }

  String? _emailValidator(String? value) {
    if (value == null || value.trim().isEmpty) return 'Email is required';
    if (!RegExp(r'^[\w\.\-]+@[\w\.\-]+\.\w{2,}$').hasMatch(value.trim())) {
      return 'Enter a valid email';
    }
    return null;
  }

  Future<void> _pay() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(checkoutControllerProvider.notifier).pay(
          fullName: _fullName.text.trim(),
          phone: _phone.text.trim(),
          line1: _line1.text.trim(),
          city: _city.text.trim(),
          province: _province.text.trim(),
        );

    if (!mounted) return;

    final state = ref.read(checkoutControllerProvider);
    final payResult = state.paywayResult;
    final orderId = state.createdOrderId;
    if (payResult != null &&
        orderId != null &&
        payResult.isWeb &&
        payResult.checkoutHtml != null &&
        payResult.checkoutHtml!.isNotEmpty) {
      context.push(
        AppRoutes.payway,
        extra:
            PaywayWebViewArgs(orderId: orderId, html: payResult.checkoutHtml!),
      );
    }
  }

  Future<void> _copyDeeplink(PaywayPaymentResult? paywayResult) async {
    final deeplink = paywayResult?.deeplink;
    if (deeplink == null || deeplink.isEmpty) return;
    await Clipboard.setData(ClipboardData(text: deeplink));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Deeplink copied')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final checkoutState = ref.watch(checkoutControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: KeyboardDismissWrapper(
        child: Form(
          key: _formKey,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
            TextFormField(
              controller: _fullName,
              decoration: const InputDecoration(labelText: 'Full name'),
              validator: _requiredValidator,
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _phone,
              decoration: const InputDecoration(labelText: 'Phone'),
              keyboardType: TextInputType.phone,
              validator: _phoneValidator,
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _email,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
              validator: _emailValidator,
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _line1,
              decoration: const InputDecoration(labelText: 'Address line'),
              validator: _requiredValidator,
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _city,
              decoration: const InputDecoration(labelText: 'City'),
              validator: _requiredValidator,
              textInputAction: TextInputAction.next,
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _province,
              decoration: const InputDecoration(labelText: 'Province'),
              validator: _requiredValidator,
              textInputAction: TextInputAction.done,
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: checkoutState.paymentMethodId,
              decoration: const InputDecoration(labelText: 'Payment option'),
              items: const [
                DropdownMenuItem(
                  value: CheckoutConstants.paymentOptionAbaDeeplink,
                  child: Text('ABA Deeplink'),
                ),
                DropdownMenuItem(
                  value: CheckoutConstants.paymentOptionCards,
                  child: Text('Cards (Web Checkout)'),
                ),
              ],
              onChanged: checkoutState.processing
                  ? null
                  : (value) {
                      if (value == null) return;
                      ref
                          .read(checkoutControllerProvider.notifier)
                          .setPaymentOption(value);
                    },
            ),
            const SizedBox(height: 16),
            if (checkoutState.error != null)
              Text(checkoutState.error!,
                  style: const TextStyle(color: Colors.red)),
            FilledButton(
              onPressed: checkoutState.processing ? null : _pay,
              child: Text(checkoutState.processing
                  ? 'Processing...'
                  : 'Pay with ABA PayWay'),
            ),
            if (checkoutState.createdOrderId != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: OutlinedButton(
                  onPressed: () => context.push(
                      '${AppRoutes.orders}/${checkoutState.createdOrderId!}'),
                  child: const Text('View order status'),
                ),
              ),
            if (checkoutState.paywayResult?.isDeepLink == true)
              Card(
                margin: const EdgeInsets.only(top: 16),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('PayWay Deeplink'),
                      if ((checkoutState.paywayResult?.qrString ?? '').isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: SelectableText(
                              'QR: ${checkoutState.paywayResult?.qrString}'),
                        ),
                      if ((checkoutState.paywayResult?.deeplink ?? '').isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 8),
                          child: SelectableText(
                              checkoutState.paywayResult?.deeplink ?? ''),
                        ),
                      const SizedBox(height: 8),
                      FilledButton(
                        onPressed: () =>
                            _copyDeeplink(checkoutState.paywayResult),
                        child: const Text('Copy deeplink'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
