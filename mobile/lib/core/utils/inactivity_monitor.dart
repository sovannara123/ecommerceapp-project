import 'dart:async';
import 'package:flutter/material.dart';

class InactivityMonitor extends StatefulWidget {
  final Widget child;
  final Duration timeout;
  final VoidCallback onTimeout;

  const InactivityMonitor({
    super.key,
    required this.child,
    this.timeout = const Duration(minutes: 15),
    required this.onTimeout,
  });

  @override
  State<InactivityMonitor> createState() => _InactivityMonitorState();
}

class _InactivityMonitorState extends State<InactivityMonitor> {
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _resetTimer();
  }

  void _resetTimer() {
    _timer?.cancel();
    _timer = Timer(widget.timeout, widget.onTimeout);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      onPointerDown: (_) => _resetTimer(),
      onPointerMove: (_) => _resetTimer(),
      child: widget.child,
    );
  }
}
