import mongoose from "mongoose";
import { Cart } from "../models/Cart.js";

export const cartRepo = {
  get(userId: string, deviceId: string) {
    return Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      deviceId,
    }).exec();
  },
  getOrCreate(userId: string, deviceId: string) {
    return Cart.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), deviceId },
      { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId), deviceId, items: [] } },
      { new: true, upsert: true }
    ).exec();
  },
  save(cart: any) {
    return cart.save();
  },
  clear(userId: string, deviceId: string, session?: mongoose.ClientSession) {
    return Cart.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId), deviceId },
      { $set: { items: [] } },
      { new: true, session }
    ).exec();
  }
};
