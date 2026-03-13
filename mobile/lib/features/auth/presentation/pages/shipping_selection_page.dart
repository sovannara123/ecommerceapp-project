// mobile/lib/features/checkout/presentation/pages/shipping_selection_page.dart

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ShippingMethod {
  final String id;
  final String name;
  final String estimate;
  final double price;
  const ShippingMethod({
    required this.id,
    required this.name,
    required this.estimate,
    required this.price,
  });
}

class ShippingSelectionPage extends StatefulWidget {
  const ShippingSelectionPage({super.key});

  @override
  State<ShippingSelectionPage> createState() => _ShippingSelectionPageState();
}

class _ShippingSelectionPageState extends State<ShippingSelectionPage> {
  static const _methods = [
    ShippingMethod(
      id: 'standard',
      name: 'Standard Shipping',
      estimate: '5–7 business days',
      price: 2.99,
    ),
    ShippingMethod(
      id: 'express',
      name: 'Express Shipping',
      estimate: '2–3 business days',
      price: 7.99,
    ),
    ShippingMethod(
      id: 'overnight',
      name: 'Overnight Delivery',
      estimate: '1 business day',
      price: 14.99,
    ),
  ];

  String _selected = 'standard';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Shipping Method')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ..._methods.map((m) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: m.id == _selected
                      ? BorderSide(color: theme.colorScheme.primary, width: 2)
                      : BorderSide.none,
                ),
                child: RadioListTile<String>(
                  value: m.id,
                  groupValue: _selected,
                  onChanged: (v) => setState(() => _selected = v!),
                  title: Text(m.name,
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(m.estimate),
                  secondary: Text(
                    '\$${m.price.toStringAsFixed(2)}',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              )),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: () {
                context.push('/checkout/review', extra: _selected);
              },
              child: const Text('Continue to Review'),
            ),
          ),
        ),
      ),
    );
  }
}