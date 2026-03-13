import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _pushNotifications = true;
  bool _emailNotifications = false;
  bool _biometric = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        children: [
          _sectionHeader('Notifications'),
          SwitchListTile(
            title: const Text('Push Notifications'),
            subtitle: const Text('Receive order and promo updates'),
            value: _pushNotifications,
            onChanged: (v) => setState(() => _pushNotifications = v),
          ),
          SwitchListTile(
            title: const Text('Email Notifications'),
            subtitle: const Text('Receive newsletters and deals'),
            value: _emailNotifications,
            onChanged: (v) => setState(() => _emailNotifications = v),
          ),
          const Divider(),
          _sectionHeader('Security'),
          SwitchListTile(
            title: const Text('Biometric Login'),
            subtitle: const Text('Use fingerprint or face ID'),
            value: _biometric,
            onChanged: (v) => setState(() => _biometric = v),
          ),
          ListTile(
            title: const Text('Change Password'),
            leading: const Icon(Icons.lock_outline),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => context.push('/forgot-password'),
          ),
          const Divider(),
          _sectionHeader('General'),
          ListTile(
            title: const Text('Language'),
            leading: const Icon(Icons.language),
            trailing: const Text('English'),
            onTap: () {},
          ),
          ListTile(
            title: const Text('Currency'),
            leading: const Icon(Icons.attach_money),
            trailing: const Text('USD'),
            onTap: () {},
          ),
          const Divider(),
          _sectionHeader('Data'),
          ListTile(
            title: const Text('Clear Cache'),
            leading: const Icon(Icons.cleaning_services_outlined),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Cache cleared')),
              );
            },
          ),
          ListTile(
            title: const Text('Delete Account'),
            leading: Icon(
              Icons.delete_forever,
              color: Theme.of(context).colorScheme.error,
            ),
            textColor: Theme.of(context).colorScheme.error,
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
        child: Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
      );
}
