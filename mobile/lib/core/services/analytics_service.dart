import 'package:firebase_analytics/firebase_analytics.dart';

class AnalyticsService {
  static final _analytics = FirebaseAnalytics.instance;

  // Auth events
  static Future<void> logSignUp(String method) =>
      _analytics.logSignUp(signUpMethod: method);

  static Future<void> logLogin(String method) =>
      _analytics.logLogin(loginMethod: method);

  // Product events
  static Future<void> logViewItem({
    required String itemId,
    required String itemName,
    required String category,
    required double price,
  }) =>
      _analytics.logViewItem(
        items: [
          AnalyticsEventItem(
            itemId: itemId,
            itemName: itemName,
            itemCategory: category,
            price: price,
          ),
        ],
      );

  static Future<void> logAddToCart({
    required String itemId,
    required String itemName,
    required double price,
    required int quantity,
  }) =>
      _analytics.logAddToCart(
        items: [
          AnalyticsEventItem(
            itemId: itemId,
            itemName: itemName,
            price: price,
            quantity: quantity,
          ),
        ],
      );

  static Future<void> logRemoveFromCart({
    required String itemId,
    required String itemName,
  }) =>
      _analytics.logRemoveFromCart(
        items: [
          AnalyticsEventItem(itemId: itemId, itemName: itemName),
        ],
      );

  // Checkout events
  static Future<void> logBeginCheckout(double totalValue) =>
      _analytics.logBeginCheckout(value: totalValue, currency: 'INR');

  static Future<void> logPurchase({
    required String orderId,
    required double totalValue,
    required String paymentMethod,
  }) =>
      _analytics.logPurchase(
        transactionId: orderId,
        value: totalValue,
        currency: 'INR',
        items: [],
      );

  // Custom events
  static Future<void> logOrderStatusChange(String orderId, String status) =>
      _analytics.logEvent(
        name: 'order_status_change',
        parameters: {'order_id': orderId, 'status': status},
      );

  static Future<void> logSearch(String query) =>
      _analytics.logSearch(searchTerm: query);

  static Future<void> logShare(String contentType, String itemId) =>
      _analytics.logShare(
        contentType: contentType,
        itemId: itemId,
        method: 'in_app',
      );

  static Future<void> logReferralSent(String referralCode) =>
      _analytics.logEvent(
        name: 'referral_sent',
        parameters: {'referral_code': referralCode},
      );

  static Future<void> logRateApp(int rating) => _analytics.logEvent(
        name: 'rate_app',
        parameters: {'rating': rating},
      );

  static Future<void> logScreenView(String screenName) =>
      _analytics.logScreenView(screenName: screenName);
}
