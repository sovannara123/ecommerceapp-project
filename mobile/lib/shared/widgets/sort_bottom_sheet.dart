import 'package:flutter/material.dart';

enum SortOption {
  relevance('Relevance'),
  priceAsc('Price: Low to High'),
  priceDesc('Price: High to Low'),
  ratingDesc('Highest Rated'),
  newest('Newest First'),
  bestSelling('Best Selling');

  final String label;
  const SortOption(this.label);
}

class SortBottomSheet extends StatelessWidget {
  final SortOption current;

  const SortBottomSheet({super.key, required this.current});

  static Future<SortOption?> show(
    BuildContext context, {
    required SortOption current,
  }) {
    return showModalBottomSheet<SortOption>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SortBottomSheet(current: current),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 12, 0, 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: theme.colorScheme.outlineVariant,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'Sort By',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 8),
          ...SortOption.values.map(
            (option) => RadioListTile<SortOption>(
              value: option,
              groupValue: current,
              title: Text(option.label),
              onChanged: (v) => Navigator.pop(context, v),
            ),
          ),
        ],
      ),
    );
  }
}
