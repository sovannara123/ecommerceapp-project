import mongoose from "mongoose";
import { Address } from "../models/Address.js";

export const addressRepo = {
  list(userId: string) {
    return Address.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ isDefault: -1, updatedAt: -1 })
      .exec();
  },
  count(userId: string) {
    return Address.countDocuments({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  },
  create(data: {
    userId: string;
    label?: "home" | "work" | "other";
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
    location?: { lat: number; lng: number };
  }) {
    return Address.create({
      ...data,
      userId: new mongoose.Types.ObjectId(data.userId),
    });
  },
  findByIdForUser(userId: string, id: string) {
    return Address.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  },
  updateByIdForUser(
    userId: string,
    id: string,
    data: Partial<{
      label: "home" | "work" | "other";
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      location?: { lat: number; lng: number };
    }>,
  ) {
    return Address.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: data },
      { new: true },
    ).exec();
  },
  deleteByIdForUser(userId: string, id: string) {
    return Address.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).exec();
  },
  unsetDefaultForUser(userId: string) {
    return Address.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isDefault: true },
      { $set: { isDefault: false } },
    ).exec();
  },
  setDefault(userId: string, id: string) {
    return Address.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { $set: { isDefault: true } },
      { new: true },
    ).exec();
  },
  findLatestForUser(userId: string) {
    return Address.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1, createdAt: -1, _id: -1 })
      .exec();
  },
};
