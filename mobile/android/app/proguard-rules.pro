# Keep annotations and source metadata for crash analysis.
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-dontwarn com.google.**

# Flutter keep rules
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-dontwarn io.flutter.embedding.**
-dontwarn io.flutter.plugin.**
-dontwarn io.flutter.plugins.**

# Gson / JSON serialization keep rules
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keepattributes Signature

# Firebase keep rules
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Stripe keep rules
-keep class com.stripe.** { *; }
-dontwarn com.stripe.**

# Razorpay keep rules (if SDK is added)
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# OkHttp / Retrofit keep rules (if SDKs are added)
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn retrofit2.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keep class retrofit2.** { *; }
-keep interface retrofit2.** { *; }

