import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
  qty: { type: Number, required: true, min: 1 },
  priceSnapshot: { type: Number, required: true, min: 0 }
}, { _id: false });

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
  deviceId: { type: String, required: true, index: true },
  items: { type: [CartItemSchema], default: [] },
}, { timestamps: true });

CartSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export const Cart = mongoose.model("Cart", CartSchema);
