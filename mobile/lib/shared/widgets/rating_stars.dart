// mobile/lib/shared/widgets/rating_stars.dart

import 'package:flutter/material.dart';

class RatingStars extends StatelessWidget {
  final double value;
  final double size;
  final bool showValue;
  final int? reviewCount;

  const RatingStars({
    super.key,
    required this.value,
    this.size = 18,
    this.showValue = true,
    this.reviewCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          final diff = value - i;
          IconData icon;
          if (diff >= 1) {
            icon = Icons.star;
          } else if (diff >= 0.5) {
            icon = Icons.star_half;
          } else {
            icon = Icons.star_border;
          }
          return Icon(icon, size: size, color: Colors.amber);
        }),
        if (showValue) ...[
          const SizedBox(width: 4),
          Text(
            value.toStringAsFixed(1),
            style: TextStyle(
              fontSize: size * 0.72,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
        if (reviewCount != null) ...[
          const SizedBox(width: 4),
          Text(
            '($reviewCount)',
            style: TextStyle(
              fontSize: size * 0.67,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ],
    );
  }
}