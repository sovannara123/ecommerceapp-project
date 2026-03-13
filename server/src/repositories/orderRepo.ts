import mongoose from "mongoose";
import { Order } from "../models/Order.js";

export const orderRepo = {
  async create(data: any, session?: mongoose.ClientSession) {
    const docs = await Order.create([data], session ? { session } : undefined);
    return docs[0];
  },
  listForUser(userId: string) {
    return Order.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  },
  getForUser(userId: string, id: string) {
    return Order.findOne({ _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) }).exec();
  },
  get(id: string) {
    return Order.findById(id).exec();
  },
  listAll(limit = 50) {
    return Order.find().sort({ createdAt: -1 }).limit(limit).exec();
  },
  update(id: string, data: any) {
    return Order.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  },
};
