import mongoose from "mongoose";
import { NotificationToken } from "../models/NotificationToken.js";

export const notificationTokenRepo = {
  upsert(userId: string, token: string, platform: "fcm" | "apns") {
    return NotificationToken.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), token },
      {
        $set: {
          platform,
          userId: new mongoose.Types.ObjectId(userId),
          token,
        },
      },
      { new: true, upsert: true },
    ).exec();
  },
};
