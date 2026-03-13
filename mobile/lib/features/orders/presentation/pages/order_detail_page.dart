import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_provider.dart';
import '../../models/order.dart';
import '../../repositories/orders_repo.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  const OrderDetailPage({
    super.key,
    required this.orderId,
  });

  final String orderId;

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  bool _loading = true;
  String? _error;
  Order? _order;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final out = await ref.read(ordersRepoProvider).getMine(widget.orderId);
      setState(() => _order = out);
    } catch (error) {
      final failure = ref.read(apiErrorMapperProvider).map(error);
      setState(() => _error = failure.message);
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Detail')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _order == null
                  ? const Center(child: Text('Order not found'))
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        Text('ID: ${_order!.id}'),
                        const SizedBox(height: 8),
                        Text('Status: ${_order!.status}'),
                        const SizedBox(height: 8),
                        Text('Total: ${_order!.total} ${_order!.currency}'),
                        const SizedBox(height: 8),
                        Text('Payment: ${_order!.paymentProvider}'),
                        if (_order!.paywayTranId.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text('PayWay Tran ID: ${_order!.paywayTranId}'),
                          ),
                        const SizedBox(height: 16),
                        const Text('Items'),
                        const SizedBox(height: 8),
                        ..._order!.items.map(
                          (item) => ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text(item.title),
                            subtitle: Text('Qty ${item.qty} • ${item.lineTotal.toStringAsFixed(2)}'),
                          ),
                        ),
                      ],
                    ),
    );
  }
}
