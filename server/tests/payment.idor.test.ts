import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { Order } from "../src/models/Order.js";
import { paymentService } from "../src/services/paymentService.js";

describe("paymentService.createPaywayPayment ownership", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns ORDER_NOT_FOUND for non-owner customer (IDOR protection)", async () => {
    const findOneSpy = jest.spyOn(Order, "findOne").mockReturnValue({
      exec: async () => null,
    } as any);

    await expect(
      paymentService.createPaywayPayment({
        orderId: "64f000000000000000000001",
        paymentOption: "abapay_deeplink",
        requester: {
          userId: "64f000000000000000000002",
          role: "customer",
        },
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "ORDER_NOT_FOUND" });

    expect(findOneSpy).toHaveBeenCalledTimes(1);
    const filter = findOneSpy.mock.calls[0][0] as any;
    expect(filter._id).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(filter.userId).toBeInstanceOf(mongoose.Types.ObjectId);
  });
});
