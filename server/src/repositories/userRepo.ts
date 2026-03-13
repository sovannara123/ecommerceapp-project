import { User } from "../models/User.js";
import { normalizeEmail } from "../utils/email.js";

export const userRepo = {
  findByEmail(email: string) {
    return User.findOne({
      email: normalizeEmail(email),
      deletedAt: { $exists: false },
    }).exec();
  },
  findById(id: string) {
    return User.findOne({ _id: id, deletedAt: { $exists: false } }).exec();
  },
  create(data: { name: string; email: string; passwordHash: string; role?: string }) {
    return User.create({ ...data, email: normalizeEmail(data.email) });
  },
  async setPasswordResetOtp(
    userId: string,
    resetOtpHash: string,
    resetOtpExpiresAt: Date,
  ) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { resetOtpHash, resetOtpExpiresAt } },
      { new: true },
    ).exec();
  },
  async updatePassword(userId: string, passwordHash: string) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: { passwordHash },
        $unset: { resetOtpHash: 1, resetOtpExpiresAt: 1 },
      },
      { new: true },
    ).exec();
  },
  async updateProfile(
    userId: string,
    update: { name?: string; phone?: string; dateOfBirth?: Date },
  ) {
    return User.findByIdAndUpdate(userId, { $set: update }, { new: true }).exec();
  },
  async updateAvatar(userId: string, avatar: string) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { avatar } },
      { new: true },
    ).exec();
  },
  async softDelete(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          deletedAt: new Date(),
          email: `deleted_${userId}`,
        },
        $unset: {
          resetOtpHash: 1,
          resetOtpExpiresAt: 1,
          avatar: 1,
          phone: 1,
          dateOfBirth: 1,
        },
      },
      { new: true },
    ).exec();
  },
};
