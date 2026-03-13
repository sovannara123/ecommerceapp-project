// mobile/lib/shared/widgets/custom_dialog.dart

import 'package:flutter/material.dart';

enum DialogType { info, success, warning, error, confirmation }

class CustomDialog extends StatelessWidget {
  final DialogType type;
  final String title;
  final String message;
  final String confirmText;
  final String? cancelText;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;

  const CustomDialog({
    super.key,
    this.type = DialogType.info,
    required this.title,
    required this.message,
    this.confirmText = 'OK',
    this.cancelText,
    this.onConfirm,
    this.onCancel,
  });

  static Future<bool?> show(
    BuildContext context, {
    required DialogType type,
    required String title,
    required String message,
    String confirmText = 'OK',
    String? cancelText,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (_) => CustomDialog(
        type: type,
        title: title,
        message: message,
        confirmText: confirmText,
        cancelText: cancelText,
      ),
    );
  }

  IconData get _icon {
    switch (type) {
      case DialogType.success:
        return Icons.check_circle;
      case DialogType.warning:
        return Icons.warning_amber_rounded;
      case DialogType.error:
        return Icons.error;
      case DialogType.confirmation:
        return Icons.help;
      default:
        return Icons.info;
    }
  }

  Color _color(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    switch (type) {
      case DialogType.success:
        return Colors.green;
      case DialogType.warning:
        return Colors.orange;
      case DialogType.error:
        return cs.error;
      case DialogType.confirmation:
        return cs.primary;
      default:
        return cs.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _color(context);

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(_icon, size: 36, color: color),
          ),
          const SizedBox(height: 16),
          Text(title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
              textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text(message,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center),
        ],
      ),
      actions: [
        if (cancelText != null)
          TextButton(
            onPressed: () {
              Navigator.pop(context, false);
              onCancel?.call();
            },
            child: Text(cancelText!),
          ),
        FilledButton(
          onPressed: () {
            Navigator.pop(context, true);
            onConfirm?.call();
          },
          style: FilledButton.styleFrom(backgroundColor: color),
          child: Text(confirmText),
        ),
      ],
    );
  }
}