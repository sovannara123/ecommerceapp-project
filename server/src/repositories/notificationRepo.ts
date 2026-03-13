import mongoose from "mongoose";
import { Notification } from "../models/Notification.js";

export const notificationRepo = {
  list(userId: string, page: number, limit: number) {
    const query = { userId: new mongoose.Types.ObjectId(userId) };
    return Notification.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  },
  count(userId: string) {
    return Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  },
  markRead(userId: string, id: string) {
    return Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: { isRead: true } },
      { new: true },
    ).exec();
  },
  markAllRead(userId: string) {
    return Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } },
    ).exec();
  },
};
