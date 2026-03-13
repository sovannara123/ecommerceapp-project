import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { createSecretKey } from "crypto";
import { config } from "../config.js";

const accessKey = () => createSecretKey(Buffer.from(config.jwtAccessSecret));
const refreshKey = () => createSecretKey(Buffer.from(config.jwtRefreshSecret));

type BaseClaims = {
  sub: string;
  role: "customer" | "admin";
  jti: string;
  type: "access" | "refresh" | "password_reset";
};

export async function signAccessToken(
  claims: Omit<BaseClaims, "type">,
  ttlSeconds: number,
) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ ...claims, type: "access" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setNotBefore(now - 5)
    .setExpirationTime(now + ttlSeconds)
    .setIssuer(config.jwtIssuer)
    .setAudience(config.jwtAudience)
    .setSubject(claims.sub)
    .setJti(claims.jti)
    .sign(accessKey());
}

export async function signRefreshToken(
  claims: Omit<BaseClaims, "type">,
  ttlDays: number,
) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ ...claims, type: "refresh" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setNotBefore(now - 5)
    .setExpirationTime(now + ttlDays * 86400)
    .setIssuer(config.jwtIssuer)
    .setAudience(config.jwtAudience)
    .setSubject(claims.sub)
    .setJti(claims.jti)
    .sign(refreshKey());
}

export async function signPasswordResetToken(
  claims: Omit<BaseClaims, "type">,
  ttlSeconds: number,
) {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ ...claims, type: "password_reset" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setNotBefore(now - 5)
    .setExpirationTime(now + ttlSeconds)
    .setIssuer(config.jwtIssuer)
    .setAudience(config.jwtAudience)
    .setSubject(claims.sub)
    .setJti(claims.jti)
    .sign(refreshKey());
}

export type VerifiedAccess = BaseClaims & JWTPayload;

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify<BaseClaims>(token, accessKey(), {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
    clockTolerance: "2s",
  });
  if (payload.type !== "access") throw new Error("Invalid token type");
  return payload as VerifiedAccess;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify<BaseClaims>(token, refreshKey(), {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
    clockTolerance: "2s",
  });
  if (payload.type !== "refresh") throw new Error("Invalid token type");
  return payload as VerifiedAccess;
}

export async function verifyPasswordResetToken(token: string) {
  const { payload } = await jwtVerify<BaseClaims>(token, refreshKey(), {
    issuer: config.jwtIssuer,
    audience: config.jwtAudience,
    clockTolerance: "2s",
  });
  if (payload.type !== "password_reset") {
    throw new Error("Invalid token type");
  }
  return payload as VerifiedAccess;
}
