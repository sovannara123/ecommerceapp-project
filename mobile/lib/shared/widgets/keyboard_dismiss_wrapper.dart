import 'package:flutter/material.dart';

/// Wrap around Scaffold body to dismiss keyboard on tap outside
class KeyboardDismissWrapper extends StatelessWidget {
  final Widget child;
  const KeyboardDismissWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      behavior: HitTestBehavior.translucent,
      child: child,
    );
  }
}
