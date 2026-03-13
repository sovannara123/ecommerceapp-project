import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userRepo } from "../repositories/userRepo.js";
import { refreshRepo } from "../repositories/refreshRepo.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} from "../utils/jwt.js";
import { objectIdSchema } from "../validators/common.js";
import { config } from "../config.js";
import { blacklistAccessJti } from "../utils/tokenBlacklist.js";
import { zxcvbnAsync } from "@zxcvbn-ts/core";
import { assertPasswordNotBreached } from "../utils/passwordBreach.js";
import { normalizeEmail } from "../utils/email.js";

const OTP_TTL_MS = 15 * 60_000;

export const authServiceDeps = {
  zxcvbnAsync,
  assertPasswordNotBreached,
  blacklistAccessJti,
};

export const authService = {
  async register(input: { name: string; email: string; password: string }) {
    const normalizedEmail = normalizeEmail(input.email);
    const existing = await userRepo.findByEmail(normalizedEmail);
    if (existing)
      throw Object.assign(new Error("Email already registered"), {
        statusCode: 409,
        code: "EMAIL_EXISTS",
      });

    const strength = await authServiceDeps.zxcvbnAsync(input.password);
    if (strength.score < 3) {
      throw Object.assign(new Error("Password too weak"), {
        statusCode: 400,
        code: "WEAK_PASSWORD",
        details: strength.feedback,
      });
    }
    await authServiceDeps.assertPasswordNotBreached(input.password);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepo.create({
      name: input.name,
      email: normalizedEmail,
      passwordHash,
      role: "customer",
    });
    return { id: String(user._id), name: user.name, email: user.email, role: user.role };
  },

  async login(input: { email: string; password: string; deviceId: string }) {
    const normalizedEmail = normalizeEmail(input.email);
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user)
      throw Object.assign(new Error("Invalid credentials"), {
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
      });

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok)
      throw Object.assign(new Error("Invalid credentials"), {
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
      });

    const accessJti = crypto.randomUUID();
    const accessToken = await signAccessToken(
      { sub: String(user._id), role: user.role, jti: accessJti },
      config.accessTokenTtlSeconds,
    );

    const refreshJti = crypto.randomUUID();
    const refreshToken = await signRefreshToken(
      { sub: String(user._id), role: user.role, jti: refreshJti },
      config.refreshTokenTtlDays,
    );
    const expiresAt = new Date(Date.now() + config.refreshTokenTtlDays * 86400_000);
    await refreshRepo.upsert(String(user._id), input.deviceId, refreshJti, expiresAt);

    return {
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
      expiresAt,
    };
  },

  async refresh(input: { refreshToken: string; deviceId: string }) {
    let payload;
    try {
      payload = await verifyRefreshToken(input.refreshToken);
    } catch {
      throw Object.assign(new Error("Invalid refresh token"), {
        statusCode: 401,
        code: "INVALID_REFRESH",
      });
    }
    const userId = objectIdSchema.parse(String(payload.sub));

    const session = await refreshRepo.find(userId, input.deviceId);
    if (!session)
      throw Object.assign(new Error("Session not found"), {
        statusCode: 401,
        code: "SESSION_NOT_FOUND",
      });
    if (session.expiresAt.getTime() < Date.now())
      throw Object.assign(new Error("Refresh expired"), {
        statusCode: 401,
        code: "REFRESH_EXPIRED",
      });
    if (payload.jti !== session.refreshJti) {
      await refreshRepo.delete(userId, input.deviceId);
      throw Object.assign(new Error("Refresh token reused"), {
        statusCode: 401,
        code: "REFRESH_REUSED",
      });
    }

    const user = await userRepo.findById(userId);
    if (!user)
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });

    const newAccessJti = crypto.randomUUID();
    const accessToken = await signAccessToken(
      { sub: String(user._id), role: user.role, jti: newAccessJti },
      config.accessTokenTtlSeconds,
    );

    const newRefreshJti = crypto.randomUUID();
    const newRefresh = await signRefreshToken(
      { sub: String(user._id), role: user.role, jti: newRefreshJti },
      config.refreshTokenTtlDays,
    );
    const expiresAt = session.expiresAt;
    await refreshRepo.upsert(userId, input.deviceId, newRefreshJti, expiresAt);

    return {
      accessToken,
      refreshToken: newRefresh,
      expiresAt,
    };
  },

  async logout(input: { userId: string; deviceId: string }) {
    await refreshRepo.delete(input.userId, input.deviceId);
    if ((input as any).jti && (input as any).exp) {
      await authServiceDeps.blacklistAccessJti((input as any).jti, (input as any).exp);
    }
    return true;
  },

  async forgotPassword(input: { email: string }) {
    const normalizedEmail = normalizeEmail(input.email);
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      return true;
    }

    const otp = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await userRepo.setPasswordResetOtp(String(user._id), otpHash, new Date(Date.now() + OTP_TTL_MS));

    // TODO: send OTP via email service
    void otp;
    return true;
  },

  async verifyOtp(input: { email: string; otp: string }) {
    const normalizedEmail = normalizeEmail(input.email);
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      throw Object.assign(new Error("Invalid or expired OTP"), {
        statusCode: 401,
        code: "INVALID_OTP",
      });
    }

    if (user.resetOtpExpiresAt.getTime() < Date.now()) {
      throw Object.assign(new Error("Invalid or expired OTP"), {
        statusCode: 401,
        code: "INVALID_OTP",
      });
    }

    const otpHash = crypto.createHash("sha256").update(input.otp).digest("hex");
    if (otpHash !== user.resetOtpHash) {
      throw Object.assign(new Error("Invalid or expired OTP"), {
        statusCode: 401,
        code: "INVALID_OTP",
      });
    }

    const resetJti = crypto.randomUUID();
    const resetToken = await signPasswordResetToken(
      { sub: String(user._id), role: user.role, jti: resetJti },
      15 * 60,
    );

    return { resetToken };
  },

  async resetPassword(input: { resetToken: string; newPassword: string }) {
    let payload;
    try {
      payload = await verifyPasswordResetToken(input.resetToken);
    } catch {
      throw Object.assign(new Error("Invalid reset token"), {
        statusCode: 401,
        code: "INVALID_RESET_TOKEN",
      });
    }

    const userId = objectIdSchema.parse(String(payload.sub));
    const user = await userRepo.findById(userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }

    const strength = await authServiceDeps.zxcvbnAsync(input.newPassword);
    if (strength.score < 3) {
      throw Object.assign(new Error("Password too weak"), {
        statusCode: 400,
        code: "WEAK_PASSWORD",
        details: strength.feedback,
      });
    }
    await authServiceDeps.assertPasswordNotBreached(input.newPassword);

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await userRepo.updatePassword(String(user._id), passwordHash);
    await refreshRepo.deleteAllForUser(String(user._id));

    return true;
  },

  async deleteAccount(input: { userId: string; accessTokenJti?: string; accessTokenExp?: number }) {
    const user = await userRepo.findById(input.userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }

    await userRepo.softDelete(String(user._id));
    await refreshRepo.deleteAllForUser(String(user._id));

    if (input.accessTokenJti && input.accessTokenExp) {
      await authServiceDeps.blacklistAccessJti(input.accessTokenJti, input.accessTokenExp);
    }

    return true;
  },
};
