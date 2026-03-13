import { redis } from "../infra/redis.js";
import { isRedisReady } from "../infra/redis.js";

const PREFIX = "blacklist:access:";

function authStoreUnavailableError() {
  return Object.assign(new Error("Authentication state store unavailable"), {
    statusCode: 503,
    code: "AUTH_STATE_UNAVAILABLE",
  });
}

export async function blacklistAccessJti(jti: string, exp: number) {
  const ttlSeconds = Math.max(0, exp - Math.floor(Date.now() / 1000));
  if (ttlSeconds <= 0) return;
  if (!isRedisReady()) throw authStoreUnavailableError();
  try {
    await redis.setEx(`${PREFIX}${jti}`, ttlSeconds, "1");
  } catch {
    throw authStoreUnavailableError();
  }
}

export async function isAccessJtiBlacklisted(jti: string) {
  if (!isRedisReady()) throw authStoreUnavailableError();
  try {
    const v = await redis.get(`${PREFIX}${jti}`);
    return v === "1";
  } catch {
    throw authStoreUnavailableError();
  }
}
