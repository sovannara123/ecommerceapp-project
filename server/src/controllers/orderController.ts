import { Request, Response } from "express";
import { orderService } from "../services/orderService.js";
import { ok } from "../utils/apiResponse.js";
import {
  adminOrderStatusSchema,
  cancelOrderSchema,
  createOrderSchema,
  orderIdParamSchema,
  returnOrderSchema,
} from "../validators/order.js";
import { deviceSchema } from "../validators/auth.js";

function getDeviceId(req: Request) {
  const deviceId = req.header("x-device-id") || "";
  deviceSchema.parse({ deviceId });
  return deviceId;
}

export const orderController = {
  async create(req: Request, res: Response) {
    const body = createOrderSchema.parse(req.body);
    const order = await orderService.createFromCart(req.user!.sub, getDeviceId(req), body);
    res.json(ok(order));
  },
  async listMine(req: Request, res: Response) {
    const orders = await orderService.listMine(req.user!.sub);
    res.json(ok(orders));
  },
  async getMine(req: Request, res: Response) {
    const { id } = orderIdParamSchema.parse(req.params);
    const order = await orderService.getMine(req.user!.sub, id);
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404, code: "ORDER_NOT_FOUND" });
    res.json(ok(order));
  },
  async adminList(req: Request, res: Response) {
    const orders = await orderService.listAll();
    res.json(ok(orders));
  },
  async adminUpdateStatus(req: Request, res: Response) {
    const { id } = orderIdParamSchema.parse(req.params);
    const { status } = adminOrderStatusSchema.parse(req.body);
    const order = await orderService.updateStatus(id, status);
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404, code: "ORDER_NOT_FOUND" });
    res.json(ok(order));
  },
  async cancel(req: Request, res: Response) {
    const { id } = orderIdParamSchema.parse(req.params);
    const body = cancelOrderSchema.parse(req.body);
    const order = await orderService.cancelOrder({
      userId: req.user!.sub,
      orderId: id,
      cancelReason: body.cancelReason,
    });
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404, code: "ORDER_NOT_FOUND" });
    res.json(ok(order));
  },
  async requestReturn(req: Request, res: Response) {
    const { id } = orderIdParamSchema.parse(req.params);
    const body = returnOrderSchema.parse(req.body);
    const order = await orderService.requestReturn({
      userId: req.user!.sub,
      orderId: id,
      returnReason: body.returnReason,
    });
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404, code: "ORDER_NOT_FOUND" });
    res.json(ok(order));
  },
  async track(req: Request, res: Response) {
    const { id } = orderIdParamSchema.parse(req.params);
    const tracking = await orderService.trackOrder({
      userId: req.user!.sub,
      orderId: id,
    });
    res.json(ok(tracking));
  },
};
