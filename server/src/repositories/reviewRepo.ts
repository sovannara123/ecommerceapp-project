import mongoose from "mongoose";
import { Review } from "../models/Review.js";

export const reviewRepo = {
  create(data: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
    images?: string[];
  }) {
    return Review.create({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
      productId: new mongoose.Types.ObjectId(data.productId),
      orderId: new mongoose.Types.ObjectId(data.orderId),
    });
  },
  findById(id: string) {
    return Review.findById(id).exec();
  },
  findByIdForUser(id: string, userId: string) {
    return Review.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  },
  findByUserAndProduct(userId: string, productId: string) {
    return Review.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    }).exec();
  },
  updateByIdForUser(
    id: string,
    userId: string,
    data: Partial<{ rating: number; comment: string; images: string[] }>,
  ) {
    return Review.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: data },
      { new: true },
    ).exec();
  },
  deleteByIdForUser(id: string, userId: string) {
    return Review.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  },
  statsForProduct(productId: string) {
    return Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]).exec();
  },
};
