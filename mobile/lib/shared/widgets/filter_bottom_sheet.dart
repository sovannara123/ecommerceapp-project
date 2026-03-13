import 'package:flutter/material.dart';

class FilterOptions {
  RangeValues priceRange;
  Set<String> categories;
  double? minRating;

  FilterOptions({
    this.priceRange = const RangeValues(0, 1000),
    Set<String>? categories,
    this.minRating,
  }) : categories = categories ?? {};
}

class FilterBottomSheet extends StatefulWidget {
  final FilterOptions initial;
  final List<String> availableCategories;

  const FilterBottomSheet({
    super.key,
    required this.initial,
    required this.availableCategories,
  });

  static Future<FilterOptions?> show(
    BuildContext context, {
    required FilterOptions initial,
    required List<String> categories,
  }) {
    return showModalBottomSheet<FilterOptions>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => FilterBottomSheet(
        initial: initial,
        availableCategories: categories,
      ),
    );
  }

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late FilterOptions _options;

  @override
  void initState() {
    super.initState();
    _options = FilterOptions(
      priceRange: widget.initial.priceRange,
      categories: Set.from(widget.initial.categories),
      minRating: widget.initial.minRating,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.7,
      maxChildSize: 0.9,
      builder: (_, scrollCtrl) => ListView(
        controller: scrollCtrl,
        padding: const EdgeInsets.all(24),
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: theme.colorScheme.outlineVariant,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Filters',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _options = FilterOptions()),
                child: const Text('Reset'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text('Price Range', style: theme.textTheme.titleSmall),
          RangeSlider(
            values: _options.priceRange,
            min: 0,
            max: 1000,
            divisions: 20,
            labels: RangeLabels(
              '\$${_options.priceRange.start.round()}',
              '\$${_options.priceRange.end.round()}',
            ),
            onChanged: (v) => setState(() => _options.priceRange = v),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('\$${_options.priceRange.start.round()}'),
              Text('\$${_options.priceRange.end.round()}'),
            ],
          ),
          const SizedBox(height: 24),
          Text('Categories', style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: widget.availableCategories.map((cat) {
              final selected = _options.categories.contains(cat);
              return FilterChip(
                label: Text(cat),
                selected: selected,
                onSelected: (v) => setState(() {
                  if (v) {
                    _options.categories.add(cat);
                  } else {
                    _options.categories.remove(cat);
                  }
                }),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          Text('Minimum Rating', style: theme.textTheme.titleSmall),
          const SizedBox(height: 8),
          Row(
            children: List.generate(5, (i) {
              final rating = i + 1;
              final selected =
                  _options.minRating != null && rating <= _options.minRating!;
              return IconButton(
                icon: Icon(
                  selected ? Icons.star : Icons.star_border,
                  color: Colors.amber,
                  size: 32,
                ),
                onPressed: () => setState(() {
                  _options.minRating =
                      _options.minRating == rating.toDouble()
                          ? null
                          : rating.toDouble();
                }),
              );
            }),
          ),
          const SizedBox(height: 32),
          SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: () => Navigator.pop(context, _options),
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }
}
