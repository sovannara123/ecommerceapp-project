import { Coupon } from "../models/Coupon.js";

export const couponRepo = {
  findByCode(code: string) {
    return Coupon.findOne({ code: code.toUpperCase().trim() }).exec();
  },
  incrementUsedCount(id: string) {
    return Coupon.findByIdAndUpdate(
      id,
      { $inc: { usedCount: 1 } },
      { new: true },
    ).exec();
  },
};
