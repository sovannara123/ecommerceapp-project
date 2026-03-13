import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { config } from "../src/config.js";
import { User } from "../src/models/User.js";
import { Order } from "../src/models/Order.js";
import { paymentService } from "../src/services/paymentService.js";
import { PayWayProvider } from "../src/services/paymentProviders/PayWayProvider.js";

describe("paymentService.createPaywayPayment payload", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    config.payway.customerEmailFallback = "";
  });

  function mockPendingOrder(userId: mongoose.Types.ObjectId) {
    return {
      _id: new mongoose.Types.ObjectId(),
      userId,
      status: "pending_payment",
      total: 100,
      currency: "USD",
      paywayTranId: "",
      address: {
        fullName: "Alice Example",
        phone: "012345678",
      },
      items: [
        { title: "Item 1", qty: 1, unitPrice: 100 },
      ],
      save: jest.fn(async () => undefined),
    } as any;
  }

  it("uses order user's email in PayWay payload", async () => {
    const userId = new mongoose.Types.ObjectId();
    const order = mockPendingOrder(userId);

    jest.spyOn(Order, "findOne").mockReturnValue({ exec: async () => order } as any);
    jest.spyOn(User, "findById").mockReturnValue({
      select: () => ({ exec: async () => ({ email: "alice@example.com" }) }),
    } as any);
    const createPaymentSpy = jest.spyOn(PayWayProvider.prototype, "createPayment").mockResolvedValue({ provider: "payway" } as any);

    await paymentService.createPaywayPayment({
      orderId: String(order._id),
      paymentOption: "abapay_deeplink",
      requester: { userId: String(userId), role: "customer" },
    });

    expect(createPaymentSpy).toHaveBeenCalledTimes(1);
    expect(createPaymentSpy.mock.calls[0][0].customer.email).toBe("alice@example.com");
  });

  it("uses configured fallback email when user email cannot be loaded", async () => {
    const userId = new mongoose.Types.ObjectId();
    const order = mockPendingOrder(userId);
    config.payway.customerEmailFallback = "fallback@example.com";

    jest.spyOn(Order, "findOne").mockReturnValue({ exec: async () => order } as any);
    jest.spyOn(User, "findById").mockReturnValue({
      select: () => ({ exec: async () => null }),
    } as any);
    const createPaymentSpy = jest.spyOn(PayWayProvider.prototype, "createPayment").mockResolvedValue({ provider: "payway" } as any);

    await paymentService.createPaywayPayment({
      orderId: String(order._id),
      paymentOption: "abapay_deeplink",
      requester: { userId: String(userId), role: "customer" },
    });

    expect(createPaymentSpy.mock.calls[0][0].customer.email).toBe("fallback@example.com");
  });

  it("fails when neither user email nor fallback email is available", async () => {
    const userId = new mongoose.Types.ObjectId();
    const order = mockPendingOrder(userId);

    jest.spyOn(Order, "findOne").mockReturnValue({ exec: async () => order } as any);
    jest.spyOn(User, "findById").mockReturnValue({
      select: () => ({ exec: async () => null }),
    } as any);
    jest.spyOn(PayWayProvider.prototype, "createPayment").mockResolvedValue({ provider: "payway" } as any);

    await expect(paymentService.createPaywayPayment({
      orderId: String(order._id),
      paymentOption: "abapay_deeplink",
      requester: { userId: String(userId), role: "customer" },
    })).rejects.toMatchObject({ code: "PAYWAY_CUSTOMER_EMAIL_UNAVAILABLE" });
  });
});
