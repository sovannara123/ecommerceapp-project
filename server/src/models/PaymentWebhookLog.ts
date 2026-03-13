import mongoose from "mongoose";
import { config } from "../config.js";

const PaymentWebhookLogSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  event: { type: String, required: true },
  signature: { type: String, default: "" },
  payload: { type: Object, required: true },
  processedAt: { type: Date, default: Date.now },
}, { timestamps: true });

PaymentWebhookLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: config.paymentWebhookLogRetentionDays * 86_400 },
);

export const PaymentWebhookLog = mongoose.model("PaymentWebhookLog", PaymentWebhookLogSchema);
