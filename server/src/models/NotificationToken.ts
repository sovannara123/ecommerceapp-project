import mongoose from "mongoose";

const NotificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    token: { type: String, required: true, trim: true, index: true },
    platform: { type: String, required: true, enum: ["fcm", "apns"] },
  },
  { timestamps: true },
);

NotificationTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

export const NotificationToken = mongoose.model(
  "NotificationToken",
  NotificationTokenSchema,
);
