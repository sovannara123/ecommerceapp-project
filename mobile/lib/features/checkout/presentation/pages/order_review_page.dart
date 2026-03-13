import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class OrderReviewPage extends ConsumerStatefulWidget {
  const OrderReviewPage({
    super.key,
    this.currency = 'USD',
    this.subtotal = 0,
    this.tax = 0,
    this.shipping = 0,
    this.discount = 0,
    this.addressSummary = 'No address selected',
    this.shippingMethod = 'No shipping method selected',
    this.paymentMethod = 'No payment method selected',
    this.onEditAddress,
    this.onEditShipping,
    this.onEditPayment,
    this.onPlaceOrder,
  });

  final String currency;
  final double subtotal;
  final double tax;
  final double shipping;
  final double discount;
  final String addressSummary;
  final String shippingMethod;
  final String paymentMethod;
  final VoidCallback? onEditAddress;
  final VoidCallback? onEditShipping;
  final VoidCallback? onEditPayment;
  final Future<void> Function()? onPlaceOrder;

  @override
  ConsumerState<OrderReviewPage> createState() => _OrderReviewPageState();
}

class _OrderReviewPageState extends ConsumerState<OrderReviewPage> {
  bool _agreedToTerms = false;
  bool _placingOrder = false;

  double get _total =>
      widget.subtotal + widget.tax + widget.shipping - widget.discount;

  Future<void> _handlePlaceOrder() async {
    if (!_agreedToTerms || _placingOrder) return;

    setState(() => _placingOrder = true);
    try {
      if (widget.onPlaceOrder != null) {
        await widget.onPlaceOrder!.call();
      } else {
        await Future<void>.delayed(const Duration(seconds: 1));
      }
    } finally {
      if (mounted) {
        setState(() => _placingOrder = false);
      }
    }
  }

  String _formatMoney(double value) {
    return '${value.toStringAsFixed(2)} ${widget.currency}';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Review Order')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _SectionCard(
            title: 'Delivery Address',
            value: widget.addressSummary,
            onEdit: widget.onEditAddress,
          ),
          const SizedBox(height: 12),
          _SectionCard(
            title: 'Shipping Method',
            value: widget.shippingMethod,
            onEdit: widget.onEditShipping,
          ),
          const SizedBox(height: 12),
          _SectionCard(
            title: 'Payment Method',
            value: widget.paymentMethod,
            onEdit: widget.onEditPayment,
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _SummaryRow(
                    label: 'Subtotal',
                    value: _formatMoney(widget.subtotal),
                  ),
                  _SummaryRow(
                    label: 'Tax',
                    value: _formatMoney(widget.tax),
                  ),
                  _SummaryRow(
                    label: 'Shipping',
                    value: _formatMoney(widget.shipping),
                  ),
                  _SummaryRow(
                    label: 'Discount',
                    value: '-${_formatMoney(widget.discount)}',
                  ),
                  const Divider(height: 24),
                  _SummaryRow(
                    label: 'Total',
                    value: _formatMoney(_total),
                    isTotal: true,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: _agreedToTerms,
            onChanged: (value) {
              setState(() => _agreedToTerms = value ?? false);
            },
            title: Text(
              'I agree to the terms and conditions',
              style: theme.textTheme.bodyMedium,
            ),
            controlAffinity: ListTileControlAffinity.leading,
          ),
          const SizedBox(height: 12),
          FilledButton(
            onPressed:
                _agreedToTerms && !_placingOrder ? _handlePlaceOrder : null,
            child: _placingOrder
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Place Order'),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.value,
    this.onEdit,
  });

  final String title;
  final String value;
  final VoidCallback? onEdit;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        subtitle: Text(value),
        trailing: TextButton(
          onPressed: onEdit,
          child: const Text('Edit'),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.isTotal = false,
  });

  final String label;
  final String value;
  final bool isTotal;

  @override
  Widget build(BuildContext context) {
    final style = isTotal
        ? Theme.of(context)
            .textTheme
            .titleMedium
            ?.copyWith(fontWeight: FontWeight.w700)
        : Theme.of(context).textTheme.bodyMedium;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(value, style: style),
        ],
      ),
    );
  }
}
