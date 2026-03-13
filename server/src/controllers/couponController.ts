import { Request, Response } from "express";
import { ok } from "../utils/apiResponse.js";
import { couponService } from "../services/couponService.js";
import { couponApplySchema, couponValidateSchema } from "../validators/coupon.js";

export const couponController = {
  async validate(req: Request, res: Response) {
    const body = couponValidateSchema.parse(req.body);
    const out = await couponService.validate(body);
    res.json(ok(out));
  },
  async apply(req: Request, res: Response) {
    const body = couponApplySchema.parse(req.body);
    const out = await couponService.apply({
      userId: req.user!.sub,
      code: body.code,
      orderId: body.orderId,
    });
    res.json(ok(out));
  },
};
