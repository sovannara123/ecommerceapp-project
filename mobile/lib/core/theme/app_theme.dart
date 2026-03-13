import 'package:flutter/material.dart';

class AppTheme {
  static const _seedColor = Color(0xFF4F46E5);

  static ThemeData light() => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: _seedColor,
        brightness: Brightness.light,
        inputDecorationTheme: _inputTheme(),
        iconButtonTheme: _iconButtonTheme(),
        textButtonTheme: _textButtonTheme(),
        filledButtonTheme: _filledButtonTheme(),
        cardTheme: _cardTheme(),
        appBarTheme: const AppBarTheme(centerTitle: true),
      );

  static ThemeData dark() => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: _seedColor,
        brightness: Brightness.dark,
        inputDecorationTheme: _inputTheme(),
        iconButtonTheme: _iconButtonTheme(),
        textButtonTheme: _textButtonTheme(),
        filledButtonTheme: _filledButtonTheme(),
        cardTheme: _cardTheme(),
        appBarTheme: const AppBarTheme(centerTitle: true),
      );

  static InputDecorationTheme _inputTheme() => InputDecorationTheme(
        filled: true,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      );

  static FilledButtonThemeData _filledButtonTheme() => FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );

  static IconButtonThemeData _iconButtonTheme() => IconButtonThemeData(
        style: IconButton.styleFrom(
          minimumSize: const Size(48, 48),
          tapTargetSize: MaterialTapTargetSize.padded,
        ),
      );

  static TextButtonThemeData _textButtonTheme() => TextButtonThemeData(
        style: TextButton.styleFrom(
          minimumSize: const Size(48, 48),
        ),
      );

  static CardThemeData _cardTheme() => CardThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 0,
        margin: EdgeInsets.zero,
      );
}
