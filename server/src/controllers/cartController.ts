import { Request, Response } from "express";
import { cartService } from "../services/cartService.js";
import { ok } from "../utils/apiResponse.js";
import { cartAddSchema, cartRemoveSchema, cartUpdateSchema } from "../validators/cart.js";
import { deviceSchema } from "../validators/auth.js";

function getDeviceId(req: Request) {
  const deviceId = req.header("x-device-id") || "";
  deviceSchema.parse({ deviceId });
  return deviceId;
}

export const cartController = {
  async get(req: Request, res: Response) {
    const cart = await cartService.getCart(req.user!.sub, getDeviceId(req));
    res.json(ok(cart));
  },
  async add(req: Request, res: Response) {
    const body = cartAddSchema.parse(req.body);
    const cart = await cartService.addItem(req.user!.sub, getDeviceId(req), body.productId, body.qty);
    res.json(ok(cart));
  },
  async update(req: Request, res: Response) {
    const body = cartUpdateSchema.parse(req.body);
    const cart = await cartService.updateQty(req.user!.sub, getDeviceId(req), body.productId, body.qty);
    res.json(ok(cart));
  },
  async remove(req: Request, res: Response) {
    const body = cartRemoveSchema.parse(req.body);
    const cart = await cartService.removeItem(req.user!.sub, getDeviceId(req), body.productId);
    res.json(ok(cart));
  },
  async clear(req: Request, res: Response) {
    const cart = await cartService.clear(req.user!.sub, getDeviceId(req));
    if (!cart) throw Object.assign(new Error("Cart not found"), { statusCode: 404, code: "CART_NOT_FOUND" });
    res.json(ok(cart));
  },
};
