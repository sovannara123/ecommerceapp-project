import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/app.dart';
import 'core/config/app_config.dart';
import 'core/config/providers.dart';
import 'core/security/device_integrity.dart';
import 'core/services/firebase_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseService.initialize();
  await FirebaseService.initMessaging();

  // Check device integrity
  final isCompromised = await DeviceIntegrity.isCompromised();
  if (isCompromised) {
    runApp(
      const MaterialApp(
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.security, size: 64, color: Colors.red),
                  SizedBox(height: 24),
                  Text(
                    'Security Warning',
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'This app cannot run on rooted or jailbroken devices '
                    'for the security of your payment information.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    return;
  }

  final config = AppConfig.fromEnvironment();
  final preferences = await SharedPreferences.getInstance();
  const secureStorage = FlutterSecureStorage();

  runApp(
    ProviderScope(
      overrides: [
        appConfigProvider.overrideWithValue(config),
        sharedPreferencesProvider.overrideWithValue(preferences),
        secureStorageProvider.overrideWithValue(secureStorage),
      ],
      child: const EcommerceApp(),
    ),
  );
}
