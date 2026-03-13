import mongoose from "mongoose";
import { Wishlist } from "../models/Wishlist.js";

export const wishlistRepo = {
  list(userId: string) {
    return Wishlist.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ addedAt: -1, _id: -1 })
      .populate("productId")
      .exec();
  },
  async upsert(userId: string, productId: string) {
    return Wishlist.updateOne(
      {
        userId: new mongoose.Types.ObjectId(userId),
        productId: new mongoose.Types.ObjectId(productId),
      },
      {
        $setOnInsert: {
          userId: new mongoose.Types.ObjectId(userId),
          productId: new mongoose.Types.ObjectId(productId),
          addedAt: new Date(),
        },
      },
      { upsert: true },
    ).exec();
  },
  remove(userId: string, productId: string) {
    return Wishlist.deleteOne({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    }).exec();
  },
};
