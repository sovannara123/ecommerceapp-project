// mobile/lib/shared/widgets/count_badge.dart

import 'package:flutter/material.dart';

class CountBadge extends StatelessWidget {
  final Widget child;
  final int count;
  final Color? color;
  final Color? textColor;

  const CountBadge({
    super.key,
    required this.child,
    required this.count,
    this.color,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return Badge(
      isLabelVisible: count > 0,
      label: Text(
        count > 99 ? '99+' : '$count',
        style: TextStyle(
          color: textColor ?? Colors.white,
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
      backgroundColor: color ?? Theme.of(context).colorScheme.error,
      child: child,
    );
  }
}