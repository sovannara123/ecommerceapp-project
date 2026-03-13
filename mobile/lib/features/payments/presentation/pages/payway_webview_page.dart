import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:ecommerce_mobile/app/router/app_routes.dart';

import '../../models/payway_payment.dart';

class PaywayWebViewPage extends StatefulWidget {
  const PaywayWebViewPage({
    super.key,
    required this.args,
  });

  final PaywayWebViewArgs args;

  @override
  State<PaywayWebViewPage> createState() => _PaywayWebViewPageState();
}

class _PaywayWebViewPageState extends State<PaywayWebViewPage> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();

    // Define trusted domains
    const allowedHosts = <String>[
      'payway.com.kh',
      'www.payway.com.kh',
      'checkout.payway.com.kh',
      // Add your API domain:
      // 'api.yourdomain.com',
    ];

    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (NavigationRequest request) {
            final url = request.url;

            // Allow initial HTML load (data URI / about:blank)
            if (url.startsWith('data:') || url == 'about:blank') {
              return NavigationDecision.navigate;
            }

            // Parse and validate
            final uri = Uri.tryParse(url);
            if (uri == null) {
              debugPrint('[WebView] Blocked malformed URL: $url');
              return NavigationDecision.prevent;
            }

            // Only allow HTTPS
            if (uri.scheme != 'https') {
              debugPrint('[WebView] Blocked non-HTTPS: $url');
              return NavigationDecision.prevent;
            }

            // Check against allowlist
            final isAllowed = allowedHosts.any(
              (host) => uri.host == host || uri.host.endsWith('.$host'),
            );

            if (!isAllowed) {
              debugPrint('[WebView] Blocked untrusted host: ${uri.host}');
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
          onPageStarted: (url) {
            debugPrint('[WebView] Loading: $url');
          },
          onWebResourceError: (error) {
            debugPrint('[WebView] Error: ${error.description}');
          },
        ),
      )
      ..enableZoom(false)
      ..loadHtmlString(widget.args.html);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            // Confirm before closing payment
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const Text('Cancel Payment?'),
                content: const Text('Are you sure you want to cancel this payment?'),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: const Text('Continue Payment'),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.pop(context);
                    },
                    child: const Text('Cancel', style: TextStyle(color: Colors.red)),
                  ),
                ],
              ),
            );
          },
        ),
        actions: [
          TextButton(
            onPressed: () => context.push('${AppRoutes.orders}/${widget.args.orderId}'),
            child: const Text('Order status'),
          ),
        ],
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
