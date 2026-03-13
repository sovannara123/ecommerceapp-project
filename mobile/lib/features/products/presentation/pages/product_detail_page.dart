import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ecommerce_mobile/core/network/dio_provider.dart';
import 'package:ecommerce_mobile/core/widgets/offline_banner.dart';
import 'package:ecommerce_mobile/features/cart/repositories/cart_repo.dart';
import 'package:ecommerce_mobile/features/catalog/models/product.dart';
import 'package:ecommerce_mobile/features/catalog/repositories/catalog_repo.dart';
import 'package:ecommerce_mobile/shared/widgets/image_carousel.dart';
import 'package:ecommerce_mobile/shared/widgets/product_card.dart';
import 'package:ecommerce_mobile/shared/widgets/rating_stars.dart';
import 'package:ecommerce_mobile/shared/widgets/review_card.dart';
import 'package:ecommerce_mobile/shared/widgets/safe_text.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  const ProductDetailPage({
    super.key,
    required this.productId,
  });

  final String productId;

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  Product? _product;
  bool _loading = true;
  bool _adding = false;
  bool _isFromCache = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final out =
          await ref.read(catalogRepoProvider).getProduct(widget.productId);
      setState(() {
        _product = out;
        _isFromCache = out.isFromCache;
        _error = null;
      });
    } catch (error) {
      final failure = ref.read(apiErrorMapperProvider).map(error);
      setState(() => _error = failure.message);
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _addToCart() async {
    setState(() => _adding = true);
    try {
      await ref
          .read(cartRepoProvider)
          .addToCart(productId: widget.productId, qty: 1);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Added to cart')),
      );
    } catch (error) {
      if (!mounted) return;
      final failure = ref.read(apiErrorMapperProvider).map(error);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(failure.message)),
      );
    } finally {
      if (mounted) {
        setState(() => _adding = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Stack(
        children: [
          _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!))
                  : _product == null
                      ? const Center(child: Text('Product not found'))
                      : CustomScrollView(
                          slivers: [
                            SliverAppBar(
                              expandedHeight: 400,
                              pinned: true,
                              actions: [
                                IconButton(
                                  icon: const Icon(Icons.share_outlined),
                                  onPressed: () {},
                                ),
                                IconButton(
                                  icon: const Icon(
                                    Icons.favorite_border,
                                    color: Colors.red,
                                  ),
                                  onPressed: () {},
                                ),
                              ],
                              flexibleSpace: FlexibleSpaceBar(
                                background: Hero(
                                  tag: 'product-image-${_product!.id}',
                                  child: ImageCarousel(
                                    images: _product!.images,
                                    aspectRatio: 1.0,
                                  ),
                                ),
                              ),
                            ),
                            SliverToBoxAdapter(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (_isFromCache)
                                      const Padding(
                                        padding: EdgeInsets.only(bottom: 8),
                                        child: Text(
                                          'Showing cached product details',
                                          style: TextStyle(color: Colors.orange),
                                        ),
                                      ),
                                    SafeText(
                                      _product!.title,
                                      maxLines: 2,
                                      style: theme.textTheme.headlineSmall
                                          ?.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    RatingStars(
                                      value: _product!.rating,
                                      reviewCount: 0,
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        SafeText(
                                          '\$${_product!.price.toStringAsFixed(2)}',
                                          maxLines: 1,
                                          style: theme.textTheme.headlineMedium
                                              ?.copyWith(
                                            color: theme.colorScheme.primary,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Color',
                                      style: theme.textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Wrap(
                                      spacing: 8,
                                      children: [
                                        Colors.black,
                                        Colors.blue,
                                        Colors.red
                                      ]
                                          .map(
                                            (c) => Container(
                                              width: 36,
                                              height: 36,
                                              decoration: BoxDecoration(
                                                color: c,
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                  color: Colors.grey.shade300,
                                                  width: 2,
                                                ),
                                              ),
                                            ),
                                          )
                                          .toList(),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Size',
                                      style: theme.textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Wrap(
                                      spacing: 8,
                                      children: ['S', 'M', 'L', 'XL']
                                          .map(
                                            (s) => ChoiceChip(
                                              label: Text(s),
                                              selected: s == 'M',
                                              onSelected: (_) {},
                                            ),
                                          )
                                          .toList(),
                                    ),
                                    const SizedBox(height: 24),
                                    Text(
                                      'Description',
                                      style: theme.textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    SafeText(
                                      _product!.description,
                                      maxLines: 6,
                                    ),
                                    const SizedBox(height: 24),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Reviews (128)',
                                          style: theme.textTheme.titleSmall
                                              ?.copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        TextButton(
                                          onPressed: () {},
                                          child: const Text('See All'),
                                        ),
                                      ],
                                    ),
                                    const ReviewCard(
                                      userName: 'Alice',
                                      rating: 5,
                                      date: '2 days ago',
                                      comment:
                                          'Excellent product! Highly recommend.',
                                    ),
                                    const ReviewCard(
                                      userName: 'Bob',
                                      rating: 4,
                                      date: '1 week ago',
                                      comment: 'Good quality, fast delivery.',
                                    ),
                                    const SizedBox(height: 24),
                                    Text(
                                      'You May Also Like',
                                      style: theme.textTheme.titleSmall?.copyWith(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    SizedBox(
                                      height: 240,
                                      child: ListView.separated(
                                        scrollDirection: Axis.horizontal,
                                        itemCount: 5,
                                        separatorBuilder: (_, __) =>
                                            const SizedBox(width: 12),
                                        itemBuilder: (_, i) => SizedBox(
                                          width: 160,
                                          child: ProductCard(
                                            id: 'related-$i',
                                            name: 'Related Product $i',
                                            imageUrl:
                                                'https://via.placeholder.com/160',
                                            price: 19.99 + i * 5,
                                            rating: 4.0,
                                            onTap: () {},
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 100),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
          const Align(
            alignment: Alignment.topCenter,
            child: OfflineBanner(),
          ),
        ],
      ),
      bottomNavigationBar: _product == null
          ? null
          : SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: theme.colorScheme.outlineVariant,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove),
                            onPressed: () {},
                          ),
                          const Text(
                            '1',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add),
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: FilledButton.icon(
                          onPressed: _adding ? null : _addToCart,
                          icon: const Icon(Icons.add_shopping_cart),
                          label: Text(
                            _adding ? 'Adding...' : 'Add to Cart',
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
