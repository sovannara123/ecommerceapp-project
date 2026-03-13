import mongoose from "mongoose";
import { RefreshSession } from "../models/RefreshSession.js";

export const refreshRepo = {
  async upsert(userId: string, deviceId: string, refreshJti: string, expiresAt: Date) {
    return RefreshSession.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), deviceId },
      { $set: { refreshJti, expiresAt } },
      { upsert: true, new: true },
    ).exec();
  },
  find(userId: string, deviceId: string) {
    return RefreshSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      deviceId,
    }).exec();
  },
  async delete(userId: string, deviceId: string) {
    return RefreshSession.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      deviceId,
    }).exec();
  },
  async deleteAllForUser(userId: string) {
    return RefreshSession.deleteMany({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  },
};
