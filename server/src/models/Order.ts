import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_PROVIDER, type OrderStatus } from "../constants/order.js";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
  title: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, default: "" },
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true, enum: Object.values(ORDER_STATUS) },
  timestamp: { type: Date, required: true, default: Date.now },
  note: { type: String, default: "" },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
  deviceId: { type: String, required: true, index: true },
  items: { type: [OrderItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ["USD", "KHR"], default: "USD" },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.pendingPayment,
    index: true,
  },
  address: { type: AddressSchema, required: true },
  paymentProvider: { type: String, enum: Object.values(PAYMENT_PROVIDER), default: PAYMENT_PROVIDER.payway },
  reservationExpiresAt: { type: Date, index: true },
  stripePaymentIntentId: { type: String, default: "" },
  paywayTranId: { type: String, default: "" },
  paywayApv: { type: String, default: "" },
  cancelledAt: { type: Date, required: false },
  cancelReason: { type: String, default: "" },
  deliveredAt: { type: Date, required: false },
  trackingNumber: { type: String, default: "" },
  returnRequested: { type: Boolean, default: false },
  returnReason: { type: String, default: "" },
  couponCode: { type: String, default: "" },
  couponDiscount: { type: Number, default: 0, min: 0 },
  totalAfterDiscount: { type: Number, default: 0, min: 0 },
  couponAppliedAt: { type: Date, required: false },
  statusHistory: { type: [StatusHistorySchema], default: [] },
}, { timestamps: true });

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model("Order", OrderSchema);
