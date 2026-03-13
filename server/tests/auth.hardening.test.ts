import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { authService, authServiceDeps } from "../src/services/authService.js";
import { refreshRepo } from "../src/repositories/refreshRepo.js";
import { userRepo } from "../src/repositories/userRepo.js";
import { signRefreshToken } from "../src/utils/jwt.js";
import { config } from "../src/config.js";
import { buildLoginRateLimitKey } from "../src/routes/modules/authRoutes.js";

describe("auth hardening behavior", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("detects refresh token reuse and deletes the device session", async () => {
    const userId = String(new mongoose.Types.ObjectId());
    const refreshToken = await signRefreshToken(
      { sub: userId, role: "customer", jti: "presented-jti" },
      config.refreshTokenTtlDays,
    );
    const deleteSpy = jest.spyOn(refreshRepo, "delete").mockResolvedValue({ deletedCount: 1 } as any);
    jest.spyOn(refreshRepo, "find").mockResolvedValue({
      refreshJti: "stored-jti",
      expiresAt: new Date(Date.now() + 60_000),
    } as any);

    await expect(authService.refresh({ refreshToken, deviceId: "device-123456" })).rejects.toMatchObject({
      code: "REFRESH_REUSED",
      statusCode: 401,
    });
    expect(deleteSpy).toHaveBeenCalledWith(userId, "device-123456");
  });

  it("blacklists active access token JTI on logout when jti/exp are provided", async () => {
    jest.spyOn(refreshRepo, "delete").mockResolvedValue({ deletedCount: 1 } as any);
    const blacklistSpy = jest.spyOn(authServiceDeps, "blacklistAccessJti").mockResolvedValue();

    const result = await authService.logout({
      userId: String(new mongoose.Types.ObjectId()),
      deviceId: "device-123456",
      jti: "access-jti-1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    } as any);

    expect(result).toBe(true);
    expect(blacklistSpy).toHaveBeenCalledWith("access-jti-1", expect.any(Number));
  });

  it("does not attempt blacklist when logout has no access token metadata", async () => {
    jest.spyOn(refreshRepo, "delete").mockResolvedValue({ deletedCount: 1 } as any);
    const blacklistSpy = jest.spyOn(authServiceDeps, "blacklistAccessJti").mockResolvedValue();

    await authService.logout({
      userId: String(new mongoose.Types.ObjectId()),
      deviceId: "device-123456",
    });

    expect(blacklistSpy).not.toHaveBeenCalled();
  });

  it("normalizes email for registration and login lookups", async () => {
    const normalized = "alice@example.com";
    jest.spyOn(authServiceDeps, "zxcvbnAsync").mockResolvedValue({ score: 4, feedback: {} } as any);
    jest.spyOn(authServiceDeps, "assertPasswordNotBreached").mockResolvedValue();
    const registerLookupSpy = jest.spyOn(userRepo, "findByEmail").mockResolvedValue(null as any);
    jest.spyOn(userRepo, "create").mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: "Alice",
      email: normalized,
      role: "customer",
    } as any);

    await authService.register({
      name: "Alice",
      email: "  Alice@Example.Com ",
      password: "StrongPass123!",
    });

    const hash = await bcrypt.hash("StrongPass123!", 4);
    const loginLookupSpy = jest.spyOn(userRepo, "findByEmail").mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      name: "Alice",
      email: normalized,
      role: "customer",
      passwordHash: hash,
    } as any);
    jest.spyOn(refreshRepo, "upsert").mockResolvedValue({} as any);

    const loginOut = await authService.login({
      email: "  ALICE@EXAMPLE.COM  ",
      password: "StrongPass123!",
      deviceId: "device-123456",
    });

    expect(registerLookupSpy).toHaveBeenCalledWith(normalized);
    expect(loginLookupSpy).toHaveBeenCalledWith(normalized);
    expect(loginOut.user.email).toBe(normalized);
  });

  it("uses normalized email in login rate-limit keying", () => {
    const key = buildLoginRateLimitKey({
      ip: "203.0.113.10",
      body: { email: "  ALICE@EXAMPLE.COM " },
    });
    expect(key).toBe("203.0.113.10:alice@example.com");
  });
});
