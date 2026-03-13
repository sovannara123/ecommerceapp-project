import mongoose from "mongoose";
import { cartRepo } from "../repositories/cartRepo.js";
import { orderRepo } from "../repositories/orderRepo.js";
import { Product } from "../models/Product.js";
import { ORDER_STATUS, PAYMENT_PROVIDER } from "../constants/order.js";

export const orderService = {
  async createFromCart(userId: string, deviceId: string, input: any) {
    const cart = await cartRepo.getOrCreate(userId, deviceId);
    if (cart.items.length === 0) throw Object.assign(new Error("Cart empty"), { statusCode: 400, code: "CART_EMPTY" });

    // Recalculate with latest product prices and validate stock (atomic-ish via per product update later)
    const productIds = cart.items.map((i: any) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).exec();
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const items = cart.items.map((i: any) => {
      const p = byId.get(String(i.productId));
      if (!p) throw Object.assign(new Error("Product not found"), { statusCode: 404, code: "PRODUCT_NOT_FOUND" });
      if (p.stock < i.qty) throw Object.assign(new Error(`Out of stock: ${p.title}`), { statusCode: 400, code: "OUT_OF_STOCK" });
      const unitPrice = p.price;
      return { productId: p._id, title: p.title, qty: i.qty, unitPrice, lineTotal: unitPrice * i.qty };
    });

    const subtotal = items.reduce((s: number, it: any) => s + it.lineTotal, 0);
    // Shipping fee must be server-authoritative; never trust client-submitted value.
    const shippingFee = 0;
    const total = subtotal + shippingFee;
    const reservationTimeoutMs = parseInt(process.env.ORDER_PAYMENT_TIMEOUT_MINUTES || "30", 10) * 60 * 1000;

    // Reserve stock with transaction
    const session = await mongoose.startSession();
    let order: any;
    try {
      await session.withTransaction(async () => {
        for (const it of items) {
          const res = await Product.updateOne(
            { _id: it.productId, stock: { $gte: it.qty } },
            { $inc: { stock: -it.qty } },
            { session }
          ).exec();
          if (res.modifiedCount !== 1) throw Object.assign(new Error("Insufficient stock during checkout"), { statusCode: 409, code: "STOCK_CONFLICT" });
        }

        order = await orderRepo.create({
          userId: new mongoose.Types.ObjectId(userId),
          deviceId,
          items,
          subtotal,
          shippingFee,
          total,
          currency: input.currency ?? "USD",
          status: ORDER_STATUS.pendingPayment,
          statusHistory: [
            {
              status: ORDER_STATUS.pendingPayment,
              timestamp: new Date(),
              note: "Order created",
            },
          ],
          reservationExpiresAt: new Date(Date.now() + reservationTimeoutMs),
          address: input.address,
          paymentProvider: input.paymentProvider ?? PAYMENT_PROVIDER.payway,
        }, session);
        // clear cart in same transaction
        const cleared = await cartRepo.clear(userId, deviceId, session);
        if (!cleared) {
          throw Object.assign(new Error("Cart clear failed"), { statusCode: 409, code: "CART_CLEAR_FAILED" });
        }
      });
    } finally {
      await session.endSession();
    }

    return order;
  },

  listMine(userId: string) {
    return orderRepo.listForUser(userId);
  },
  getMine(userId: string, orderId: string) {
    return orderRepo.getForUser(userId, orderId);
  },
  listAll() {
    return orderRepo.listAll(100);
  },
  updateStatus(orderId: string, status: string) {
    const updatePayload: Record<string, unknown> = {
      status,
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          note: "Status updated by admin",
        },
      },
    };
    if (status === ORDER_STATUS.delivered) {
      updatePayload.deliveredAt = new Date();
    }
    return orderRepo.update(orderId, updatePayload);
  },
  async cancelOrder(input: {
    userId: string;
    orderId: string;
    cancelReason?: string;
  }) {
    const order = await orderRepo.getForUser(input.userId, input.orderId);
    if (!order) {
      throw Object.assign(new Error("Order not found"), {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    const cancellableStatuses = new Set([
      ORDER_STATUS.pendingPayment,
      ORDER_STATUS.paid,
      ORDER_STATUS.processing,
    ]);
    if (!cancellableStatuses.has(order.status as any)) {
      throw Object.assign(new Error("Order cannot be cancelled at this stage"), {
        statusCode: 400,
        code: "ORDER_CANNOT_CANCEL",
      });
    }

    const updated = await orderRepo.update(input.orderId, {
      status: ORDER_STATUS.cancelled,
      cancelledAt: new Date(),
      cancelReason: input.cancelReason ?? "",
      $push: {
        statusHistory: {
          status: ORDER_STATUS.cancelled,
          timestamp: new Date(),
          note: input.cancelReason || "Order cancelled by customer",
        },
      },
    });

    // TODO: trigger refund if payment was captured
    return updated;
  },
  async requestReturn(input: {
    userId: string;
    orderId: string;
    returnReason: string;
  }) {
    const order = await orderRepo.getForUser(input.userId, input.orderId);
    if (!order) {
      throw Object.assign(new Error("Order not found"), {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    if (order.status !== ORDER_STATUS.delivered || !order.deliveredAt) {
      throw Object.assign(new Error("Order is not eligible for return"), {
        statusCode: 400,
        code: "ORDER_RETURN_NOT_ALLOWED",
      });
    }

    const returnDeadline = new Date(order.deliveredAt).getTime() + 7 * 24 * 60 * 60 * 1000;
    if (Date.now() > returnDeadline) {
      throw Object.assign(new Error("Return window has expired"), {
        statusCode: 400,
        code: "ORDER_RETURN_EXPIRED",
      });
    }

    const updated = await orderRepo.update(input.orderId, {
      returnRequested: true,
      returnReason: input.returnReason,
      $push: {
        statusHistory: {
          status: order.status,
          timestamp: new Date(),
          note: `Return requested: ${input.returnReason}`,
        },
      },
    });
    return updated;
  },
  async trackOrder(input: { userId: string; orderId: string }) {
    const order = await orderRepo.getForUser(input.userId, input.orderId);
    if (!order) {
      throw Object.assign(new Error("Order not found"), {
        statusCode: 404,
        code: "ORDER_NOT_FOUND",
      });
    }

    const statusHistory =
      Array.isArray(order.statusHistory) && order.statusHistory.length > 0
        ? order.statusHistory
        : [
            {
              status: order.status,
              timestamp: order.updatedAt || order.createdAt,
              note: "",
            },
          ];

    return {
      statusHistory,
      ...(order.trackingNumber ? { trackingNumber: order.trackingNumber } : {}),
    };
  },
};
