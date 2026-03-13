import bcrypt from "bcryptjs";
import path from "node:path";
import { userRepo } from "../repositories/userRepo.js";
import { refreshRepo } from "../repositories/refreshRepo.js";
import { zxcvbnAsync } from "@zxcvbn-ts/core";
import { assertPasswordNotBreached } from "../utils/passwordBreach.js";

export const userServiceDeps = {
  zxcvbnAsync,
  assertPasswordNotBreached,
};

function toPublicProfile(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    dateOfBirth: user.dateOfBirth || null,
    avatar: user.avatar || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }
    return toPublicProfile(user);
  }

  async updateProfile(
    userId: string,
    input: { name?: string; phone?: string; dateOfBirth?: string },
  ) {
    const update: { name?: string; phone?: string; dateOfBirth?: Date } = {};
    if (input.name !== undefined) update.name = input.name;
    if (input.phone !== undefined) update.phone = input.phone;
    if (input.dateOfBirth !== undefined) {
      update.dateOfBirth = new Date(input.dateOfBirth);
    }

    const user = await userRepo.updateProfile(userId, update);
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }
    return toPublicProfile(user);
  }

  async changePassword(
    userId: string,
    input: { currentPassword: string; newPassword: string },
  ) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }

    const matchesCurrent = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!matchesCurrent) {
      throw Object.assign(new Error("Current password is incorrect"), {
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
      });
    }

    const strength = await userServiceDeps.zxcvbnAsync(input.newPassword);
    if (strength.score < 3) {
      throw Object.assign(new Error("Password too weak"), {
        statusCode: 400,
        code: "WEAK_PASSWORD",
        details: strength.feedback,
      });
    }
    await userServiceDeps.assertPasswordNotBreached(input.newPassword);

    const nextPasswordHash = await bcrypt.hash(input.newPassword, 10);
    await userRepo.updatePassword(userId, nextPasswordHash);
    await refreshRepo.deleteAllForUser(userId);

    return true;
  }

  async uploadAvatar(userId: string, fileName: string) {
    const avatarUrl = path.posix.join("/uploads/avatars", fileName);
    const user = await userRepo.updateAvatar(userId, avatarUrl);
    if (!user) {
      throw Object.assign(new Error("User not found"), {
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    }

    return { avatarUrl };
  }
}

export const userService = new UserService();
