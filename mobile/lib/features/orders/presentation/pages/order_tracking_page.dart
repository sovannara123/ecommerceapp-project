import 'package:flutter/material.dart';

class TrackingStep {
  final String title;
  final String subtitle;
  final DateTime? dateTime;
  final bool completed;
  const TrackingStep({
    required this.title,
    required this.subtitle,
    this.dateTime,
    this.completed = false,
  });
}

class OrderTrackingPage extends StatelessWidget {
  final String orderId;
  const OrderTrackingPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final steps = [
      TrackingStep(
        title: 'Order Placed',
        subtitle: 'Your order has been confirmed',
        dateTime: DateTime.now().subtract(const Duration(days: 2)),
        completed: true,
      ),
      TrackingStep(
        title: 'Processing',
        subtitle: 'Seller is preparing your order',
        dateTime: DateTime.now().subtract(const Duration(days: 1)),
        completed: true,
      ),
      TrackingStep(
        title: 'Shipped',
        subtitle: 'On the way to delivery hub',
        dateTime: DateTime.now(),
        completed: true,
      ),
      const TrackingStep(
        title: 'Out for Delivery',
        subtitle: 'Driver is heading to your address',
      ),
      const TrackingStep(
        title: 'Delivered',
        subtitle: 'Package has been delivered',
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text('Track Order #$orderId')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Container(
            height: 200,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Center(
              child: Icon(Icons.map_outlined, size: 64),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Tracking Progress',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ...List.generate(steps.length, (i) {
            final step = steps[i];
            final isLast = i == steps.length - 1;

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: step.completed
                              ? theme.colorScheme.primary
                              : theme.colorScheme.outlineVariant,
                        ),
                        child: step.completed
                            ? const Icon(
                                Icons.check,
                                size: 14,
                                color: Colors.white,
                              )
                            : null,
                      ),
                      if (!isLast)
                        Expanded(
                          child: Container(
                            width: 2,
                            color: step.completed
                                ? theme.colorScheme.primary
                                : theme.colorScheme.outlineVariant,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step.title,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: step.completed
                                  ? null
                                  : theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            step.subtitle,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          if (step.dateTime != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              '${step.dateTime!.day}/${step.dateTime!.month}/${step.dateTime!.year} '
                              '${step.dateTime!.hour}:${step.dateTime!.minute.toString().padLeft(2, '0')}',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: theme.colorScheme.primary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
