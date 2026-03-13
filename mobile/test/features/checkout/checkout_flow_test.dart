import 'package:dio/dio.dart';
import 'package:ecommerce_mobile/features/checkout/presentation/pages/checkout_page.dart';
import 'package:ecommerce_mobile/features/orders/models/address.dart';
import 'package:ecommerce_mobile/features/orders/models/order.dart';
import 'package:ecommerce_mobile/features/orders/models/order_item.dart';
import 'package:ecommerce_mobile/features/orders/presentation/pages/order_detail_page.dart';
import 'package:ecommerce_mobile/features/orders/repositories/orders_repo.dart';
import 'package:ecommerce_mobile/features/payments/models/payway_payment.dart';
import 'package:ecommerce_mobile/features/payments/repositories/payments_repo.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';

class _FakeOrdersRepo extends OrdersRepo {
  _FakeOrdersRepo() : super(Dio());

  int createOrderCalls = 0;
  Address? lastAddress;
  Order createOrderResult = _sampleOrder(status: 'pending_payment');
  Object? createOrderError;

  Order getMineResult = _sampleOrder(status: 'pending_payment');

  @override
  Future<Order> createOrder({
    required Address address,
    double shippingFee = 0,
    String currency = 'USD',
    String paymentProvider = 'payway',
    String paymentOption = 'abapay_deeplink',
  }) async {
    createOrderCalls += 1;
    lastAddress = address;
    if (createOrderError != null) throw createOrderError!;
    return createOrderResult;
  }

  @override
  Future<Order> getMine(String id) async {
    return getMineResult;
  }
}

class _FakePaymentsRepo extends PaymentsRepo {
  _FakePaymentsRepo() : super(Dio());

  PaywayPaymentResult result = const PaywayPaymentResult(
    provider: 'payway',
    mode: 'web',
    tranId: 'tran-1',
    checkoutHtml: '<html></html>',
  );

  @override
  Future<PaywayPaymentResult> createPaywayPayment({
    required String orderId,
    required String paymentOption,
  }) async {
    return result;
  }
}

Order _sampleOrder({required String status}) {
  return Order(
    id: 'order-1',
    userId: 'user-1',
    deviceId: 'device-1',
    items: const [
      OrderItem(
        productId: 'product-1',
        title: 'Demo Item',
        qty: 1,
        unitPrice: 10,
        lineTotal: 10,
      ),
    ],
    subtotal: 10,
    shippingFee: 0,
    total: 10,
    currency: 'USD',
    status: status,
    address: const Address(
      fullName: 'Test User',
      phone: '012345678',
      line1: 'Street',
      city: 'Phnom Penh',
      province: 'Phnom Penh',
      postalCode: '',
    ),
    paymentProvider: 'payway',
    paywayTranId: 'tran-1',
    paywayApv: 'apv-1',
    createdAt: DateTime.now(),
  );
}

NavigationDecision _paywayNavigationDecision(String url, {String apiHost = 'api.example.com'}) {
  final uri = Uri.tryParse(url);
  if (uri == null) return NavigationDecision.prevent;

  final allowedHosts = [
    'payway.com.kh',
    'www.payway.com.kh',
    if (apiHost.isNotEmpty) apiHost,
  ];

  if (url.startsWith('data:') || url == 'about:blank') {
    return NavigationDecision.navigate;
  }

  if (uri.scheme == 'https' && allowedHosts.any((h) => uri.host == h || uri.host.endsWith('.$h'))) {
    return NavigationDecision.navigate;
  }

  return NavigationDecision.prevent;
}

Future<void> _pumpCheckoutApp(
  WidgetTester tester, {
  required _FakeOrdersRepo ordersRepo,
  required _FakePaymentsRepo paymentsRepo,
}) async {
  final router = GoRouter(
    initialLocation: '/checkout',
    routes: [
      GoRoute(
        path: '/checkout',
        builder: (context, state) => const CheckoutPage(),
      ),
      GoRoute(
        path: '/payway',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('PayWay Route')),
        ),
      ),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) {
          final orderId = state.pathParameters['id']!;
          return OrderDetailPage(orderId: orderId);
        },
      ),
    ],
  );

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        ordersRepoProvider.overrideWithValue(ordersRepo),
        paymentsRepoProvider.overrideWithValue(paymentsRepo),
      ],
      child: MaterialApp.router(routerConfig: router),
    ),
  );
  await tester.pumpAndSettle();
}

Future<void> _fillCheckoutForm(WidgetTester tester) async {
  await tester.enterText(find.widgetWithText(TextField, 'Full name'), 'Test User');
  await tester.enterText(find.widgetWithText(TextField, 'Phone'), '012345678');
  await tester.enterText(find.widgetWithText(TextField, 'Address line'), 'Street 123');
  await tester.enterText(find.widgetWithText(TextField, 'City'), 'Phnom Penh');
  await tester.enterText(find.widgetWithText(TextField, 'Province'), 'Phnom Penh');
}

DioException _validationError() {
  final request = RequestOptions(path: '/orders');
  return DioException(
    requestOptions: request,
    response: Response<Map<String, dynamic>>(
      requestOptions: request,
      statusCode: 400,
      data: const {'message': 'Validation failed'},
    ),
    type: DioExceptionType.badResponse,
    error: 'validation',
  );
}

void main() {
  group('Checkout Flow', () {
    testWidgets('checkout form starts with empty fields', (tester) async {
      final ordersRepo = _FakeOrdersRepo();
      final paymentsRepo = _FakePaymentsRepo();

      await _pumpCheckoutApp(
        tester,
        ordersRepo: ordersRepo,
        paymentsRepo: paymentsRepo,
      );

      final fields = tester.widgetList<EditableText>(find.byType(EditableText));
      for (final field in fields) {
        expect(field.controller.text, isEmpty);
      }
    });

    testWidgets('form validation shows errors for empty required fields', (tester) async {
      final ordersRepo = _FakeOrdersRepo()..createOrderError = _validationError();
      final paymentsRepo = _FakePaymentsRepo();

      await _pumpCheckoutApp(
        tester,
        ordersRepo: ordersRepo,
        paymentsRepo: paymentsRepo,
      );

      await tester.tap(find.text('Pay with ABA PayWay'));
      await tester.pumpAndSettle();

      expect(find.text('Validation failed'), findsOneWidget);
      expect(ordersRepo.createOrderCalls, 1);
    });

    testWidgets('successful order creation navigates to payment', (tester) async {
      final ordersRepo = _FakeOrdersRepo();
      final paymentsRepo = _FakePaymentsRepo()
        ..result = const PaywayPaymentResult(
          provider: 'payway',
          mode: 'web',
          tranId: 'tran-web',
          checkoutHtml: '<html><body>PayWay</body></html>',
        );

      await _pumpCheckoutApp(
        tester,
        ordersRepo: ordersRepo,
        paymentsRepo: paymentsRepo,
      );

      await _fillCheckoutForm(tester);
      await tester.tap(find.text('Pay with ABA PayWay'));
      await tester.pumpAndSettle();

      expect(find.text('PayWay Route'), findsOneWidget);
    });

    testWidgets('WebView navigation delegate blocks untrusted URLs', (tester) async {
      expect(_paywayNavigationDecision('about:blank'), NavigationDecision.navigate);
      expect(_paywayNavigationDecision('data:text/html;base64,SGVsbG8='), NavigationDecision.navigate);
      expect(_paywayNavigationDecision('https://www.payway.com.kh/checkout'), NavigationDecision.navigate);
      expect(_paywayNavigationDecision('https://api.example.com/payments/callback'), NavigationDecision.navigate);
      expect(_paywayNavigationDecision('https://evil.example.com/phish'), NavigationDecision.prevent);
      expect(_paywayNavigationDecision('http://www.payway.com.kh/checkout'), NavigationDecision.prevent);
    });

    testWidgets('payment callback flow shows updated paid order status', (tester) async {
      final ordersRepo = _FakeOrdersRepo()
        ..createOrderResult = _sampleOrder(status: 'pending_payment')
        ..getMineResult = _sampleOrder(status: 'paid');
      final paymentsRepo = _FakePaymentsRepo()
        ..result = const PaywayPaymentResult(
          provider: 'payway',
          mode: 'deeplink',
          tranId: 'tran-deeplink',
          deeplink: 'aba://pay',
        );

      await _pumpCheckoutApp(
        tester,
        ordersRepo: ordersRepo,
        paymentsRepo: paymentsRepo,
      );

      await _fillCheckoutForm(tester);
      await tester.tap(find.text('Pay with ABA PayWay'));
      await tester.pumpAndSettle();

      await tester.tap(find.text('View order status'));
      await tester.pumpAndSettle();

      expect(find.text('Status: paid'), findsOneWidget);
    });
  });
}
