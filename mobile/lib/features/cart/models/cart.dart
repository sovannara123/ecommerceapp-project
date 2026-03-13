import 'package:flutter/foundation.dart';

import 'cart_item.dart';

@immutable
class Cart {
  const Cart({
    this.items = const [],
    this.subtotalCents = 0,
    this.shippingCents = 0,
    this.taxCents = 0,
    this.discountCents = 0,
    this.couponCode,
  });

  final List<CartItem> items;
  final int subtotalCents;
  final int shippingCents;
  final int taxCents;
  final int discountCents;
  final String? couponCode;

  /// Grand total in cents — always >= 0.
  int get totalCents =>
      (subtotalCents + shippingCents + taxCents - discountCents)
          .clamp(0, double.maxFinite.toInt());

  int get itemCount => items.fold<int>(0, (sum, i) => sum + i.qty);

  Cart copyWith({
    List<CartItem>? items,
    int? subtotalCents,
    int? shippingCents,
    int? taxCents,
    int? discountCents,
    String? couponCode,
  }) {
    return Cart(
      items: items ?? this.items,
      subtotalCents: subtotalCents ?? this.subtotalCents,
      shippingCents: shippingCents ?? this.shippingCents,
      taxCents: taxCents ?? this.taxCents,
      discountCents: discountCents ?? this.discountCents,
      couponCode: couponCode ?? this.couponCode,
    );
  }

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => CartItem.fromJson(e as Map<String, dynamic>))
              .toList(growable: false) ??
          const [],
      subtotalCents: (json['subtotalCents'] as num?)?.toInt() ?? 0,
      shippingCents: (json['shippingCents'] as num?)?.toInt() ?? 0,
      taxCents: (json['taxCents'] as num?)?.toInt() ?? 0,
      discountCents: (json['discountCents'] as num?)?.toInt() ?? 0,
      couponCode: json['couponCode'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'items': items.map((item) => item.toJson()).toList(growable: false),
        'subtotalCents': subtotalCents,
        'shippingCents': shippingCents,
        'taxCents': taxCents,
        'discountCents': discountCents,
        'couponCode': couponCode,
      };
}
