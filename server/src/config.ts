import { z } from "zod";

function strongSecret() {
  return z
    .string()
    .min(16, "secret too short")
    .refine((v) => !/^change_me_/i.test(v), "secret uses placeholder value");
}

function envBoolean(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return value ?? defaultValue;

    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off", ""].includes(normalized)) return false;
    return value;
  }, z.boolean().default(defaultValue));
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).default("info"),
    PORT: z.coerce.number().int().positive().default(8080),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    JWT_ISSUER: z.string().default("ecommerce-api"),
    JWT_AUDIENCE: z.string().default("ecommerce-clients"),
    JWT_ACCESS_SECRET: strongSecret(),
    JWT_REFRESH_SECRET: strongSecret(),
    ACCESS_TOKEN_TTL_MIN: z.coerce.number().int().positive().default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
    HIBP_PASSWORD_CHECK_ENABLED: envBoolean(false),
    HIBP_PASSWORD_CHECK_STRICT: envBoolean(false),
    HIBP_API_BASE_URL: z.string().default("https://api.pwnedpasswords.com"),
    HIBP_TIMEOUT_MS: z.coerce.number().int().positive().default(3000),

    MONGO_URI: z.string().default("mongodb://localhost:27017/ecommerce"),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    REDIS_CONNECT_MAX_RETRIES: z.coerce.number().int().positive().default(10),
    REDIS_CONNECT_RETRY_DELAY_MS: z.coerce.number().int().positive().default(1000),

    PAYWAY_BASE_URL: z.string().optional(),
    PAYWAY_MERCHANT_ID: z.string().optional(),
    PAYWAY_PUBLIC_KEY: z.string().optional(),
    PAYWAY_MERCHANT_REFERER: z.string().optional().default("http://localhost"),
    PAYWAY_CUSTOMER_EMAIL_FALLBACK: z.string().optional().default(""),
    PAYWAY_RETURN_URL_BASE64: z.string().optional().default(""),
    PAYWAY_CANCEL_URL: z.string().optional().default(""),
    PAYWAY_CONTINUE_SUCCESS_URL: z.string().optional().default(""),
    PAYWAY_WEBHOOK_SECRET: z.string().optional(),
    PAYWAY_WEBHOOK_IDEMPOTENCY_TTL_SEC: z.coerce.number().int().positive().default(86_400),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_WEBHOOK_IDEMPOTENCY_TTL_SEC: z.coerce.number().int().positive().default(86_400),

    PAYMENT_WEBHOOK_LOG_RETENTION_DAYS: z.coerce.number().int().positive().default(30),
  })
  .superRefine((val, ctx) => {
    const needsPayWay = val.NODE_ENV === "production";
    if (needsPayWay) {
      const required: Array<[string, string | undefined]> = [
        ["PAYWAY_BASE_URL", val.PAYWAY_BASE_URL],
        ["PAYWAY_MERCHANT_ID", val.PAYWAY_MERCHANT_ID],
        ["PAYWAY_PUBLIC_KEY", val.PAYWAY_PUBLIC_KEY],
        ["PAYWAY_MERCHANT_REFERER", val.PAYWAY_MERCHANT_REFERER],
      ];
      required.forEach(([k, v]) => {
        if (!v) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k], message: `${k} is required in production` });
      });
    }
  });

const parsed = envSchema.parse(process.env);

export const config = {
  nodeEnv: parsed.NODE_ENV,
  logLevel: parsed.LOG_LEVEL,
  port: parsed.PORT,
  corsOrigins: parsed.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean),

  jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsed.JWT_REFRESH_SECRET,
  jwtIssuer: parsed.JWT_ISSUER,
  jwtAudience: parsed.JWT_AUDIENCE,
  accessTokenTtlSeconds: parsed.ACCESS_TOKEN_TTL_MIN * 60,
  refreshTokenTtlDays: parsed.REFRESH_TOKEN_TTL_DAYS,
  hibp: {
    enabled: parsed.HIBP_PASSWORD_CHECK_ENABLED,
    strict: parsed.HIBP_PASSWORD_CHECK_STRICT,
    apiBaseUrl: parsed.HIBP_API_BASE_URL,
    timeoutMs: parsed.HIBP_TIMEOUT_MS,
  },

  mongoUri: parsed.MONGO_URI,
  redisUrl: parsed.REDIS_URL,
  redis: {
    connectMaxRetries: parsed.REDIS_CONNECT_MAX_RETRIES,
    connectRetryDelayMs: parsed.REDIS_CONNECT_RETRY_DELAY_MS,
  },

  payway: {
    baseUrl: parsed.PAYWAY_BASE_URL || "",
    merchantId: parsed.PAYWAY_MERCHANT_ID || "",
    publicKey: parsed.PAYWAY_PUBLIC_KEY || "",
    referer: parsed.PAYWAY_MERCHANT_REFERER || "",
    customerEmailFallback: parsed.PAYWAY_CUSTOMER_EMAIL_FALLBACK || "",
    returnUrlBase64: parsed.PAYWAY_RETURN_URL_BASE64,
    cancelUrl: parsed.PAYWAY_CANCEL_URL,
    continueSuccessUrl: parsed.PAYWAY_CONTINUE_SUCCESS_URL,
    webhookSecret: parsed.PAYWAY_WEBHOOK_SECRET || "",
    webhookIdempotencyTtlSec: parsed.PAYWAY_WEBHOOK_IDEMPOTENCY_TTL_SEC,
  },

  stripe: {
    secretKey: parsed.STRIPE_SECRET_KEY || "",
    webhookSecret: parsed.STRIPE_WEBHOOK_SECRET || "",
    webhookIdempotencyTtlSec: parsed.STRIPE_WEBHOOK_IDEMPOTENCY_TTL_SEC,
  },

  paymentWebhookLogRetentionDays: parsed.PAYMENT_WEBHOOK_LOG_RETENTION_DAYS,
};
