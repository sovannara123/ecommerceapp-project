import mongoose from "mongoose";

const RefreshSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
  deviceId: { type: String, required: true, index: true },
  refreshJti: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

RefreshSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshSession = mongoose.model("RefreshSession", RefreshSessionSchema);
