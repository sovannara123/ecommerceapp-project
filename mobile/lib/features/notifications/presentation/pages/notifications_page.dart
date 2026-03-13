import 'package:flutter/material.dart';

class NotificationsPage extends StatelessWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final notifications = <_NotifItem>[
      const _NotifItem(
        icon: Icons.local_shipping,
        title: 'Order Shipped',
        body: 'Your order #1234 has been shipped.',
        time: '2 hours ago',
        read: false,
      ),
      const _NotifItem(
        icon: Icons.local_offer,
        title: '20% Off Electronics',
        body: 'Use code ELEC20 at checkout.',
        time: '1 day ago',
        read: true,
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          TextButton(
            onPressed: () {},
            child: const Text('Mark All Read'),
          ),
        ],
      ),
      body: notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.notifications_off_outlined,
                    size: 80,
                    color: theme.colorScheme.outlineVariant,
                  ),
                  const SizedBox(height: 16),
                  const Text('No notifications yet'),
                ],
              ),
            )
          : ListView.separated(
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) {
                final n = notifications[i];
                return ListTile(
                  tileColor: n.read
                      ? null
                      : theme.colorScheme.primaryContainer.withValues(alpha: 0.15),
                  leading: CircleAvatar(
                    backgroundColor: theme.colorScheme.primaryContainer,
                    child: Icon(n.icon, color: theme.colorScheme.primary),
                  ),
                  title: Text(
                    n.title,
                    style: TextStyle(
                      fontWeight: n.read ? FontWeight.normal : FontWeight.bold,
                    ),
                  ),
                  subtitle: Text(
                    n.body,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Text(
                    n.time,
                    style: theme.textTheme.bodySmall,
                  ),
                );
              },
            ),
    );
  }
}

class _NotifItem {
  final IconData icon;
  final String title;
  final String body;
  final String time;
  final bool read;
  const _NotifItem({
    required this.icon,
    required this.title,
    required this.body,
    required this.time,
    required this.read,
  });
}
