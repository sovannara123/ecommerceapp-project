import { createClient } from "redis";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const redis = createClient({
  url: config.redisUrl,
  socket: {
    reconnectStrategy(retries) {
      return Math.min(config.redis.connectRetryDelayMs * Math.max(1, retries), 5_000);
    },
  },
});

let listenersBound = false;

export async function connectRedis() {
  if (!listenersBound) {
    redis.on("error", (err) => logger.error({ err }, "Redis error"));
    listenersBound = true;
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= config.redis.connectMaxRetries; attempt += 1) {
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
      logger.info("Redis connected");
      return;
    } catch (err) {
      lastError = err;
      logger.warn({
        attempt,
        maxRetries: config.redis.connectMaxRetries,
      }, "Redis connect retry");
      if (attempt < config.redis.connectMaxRetries) {
        await wait(config.redis.connectRetryDelayMs * attempt);
      }
    }
  }

  throw lastError;
}

export async function disconnectRedis() {
  if (!redis.isOpen) return;
  await redis.quit();
  logger.info("Redis disconnected");
}

export function isRedisReady() {
  return redis.isOpen && redis.isReady;
}
