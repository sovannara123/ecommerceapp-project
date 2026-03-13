import { redis } from "../infra/redis.js";
import { isRedisReady } from "../infra/redis.js";

export async function ensureOnce(key: string, ttlSeconds: number): Promise<boolean> {
  if (!isRedisReady()) {
    throw Object.assign(new Error("Idempotency store unavailable"), {
      statusCode: 503,
      code: "IDEMPOTENCY_STORE_UNAVAILABLE",
    });
  }

  try {
    const res = await redis.set(key, "1", { NX: true, EX: ttlSeconds });
    return res === "OK";
  } catch {
    throw Object.assign(new Error("Idempotency store unavailable"), {
      statusCode: 503,
      code: "IDEMPOTENCY_STORE_UNAVAILABLE",
    });
  }
}
