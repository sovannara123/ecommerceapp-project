import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class HelpPage extends StatelessWidget {
  const HelpPage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Help & Support')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Frequently Asked Questions',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          const ExpansionTile(
            title: Text('How do I track my order?'),
            children: [
              Padding(
                padding: EdgeInsets.all(16),
                child: Text('Go to Orders → tap on an order → Track Order.'),
              ),
            ],
          ),
          const ExpansionTile(
            title: Text('What payment methods are accepted?'),
            children: [
              Padding(
                padding: EdgeInsets.all(16),
                child: Text('We accept ABA PayWay, Visa, and Mastercard.'),
              ),
            ],
          ),
          const ExpansionTile(
            title: Text('How do I return a product?'),
            children: [
              Padding(
                padding: EdgeInsets.all(16),
                child: Text('Contact support within 7 days of delivery.'),
              ),
            ],
          ),
          const Divider(height: 32),
          Text(
            'Contact Us',
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          ListTile(
            leading: CircleAvatar(
              backgroundColor: theme.colorScheme.primaryContainer,
              child: const Icon(Icons.email_outlined),
            ),
            title: const Text('Email Support'),
            subtitle: const Text('support@shopease.com'),
            onTap: () => launchUrl(Uri.parse('mailto:support@shopease.com')),
          ),
          ListTile(
            leading: CircleAvatar(
              backgroundColor: theme.colorScheme.primaryContainer,
              child: const Icon(Icons.phone_outlined),
            ),
            title: const Text('Phone Support'),
            subtitle: const Text('+855 23 456 789'),
            onTap: () => launchUrl(Uri.parse('tel:+85523456789')),
          ),
          ListTile(
            leading: CircleAvatar(
              backgroundColor: theme.colorScheme.primaryContainer,
              child: const Icon(Icons.chat_outlined),
            ),
            title: const Text('Live Chat'),
            subtitle: const Text('Available 9 AM – 6 PM'),
            onTap: () {
              // Open chat
            },
          ),
        ],
      ),
    );
  }
}
