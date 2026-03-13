import mongoose from "mongoose";
import { jest } from "@jest/globals";

import { cartService } from "../src/services/cartService.js";
import { cartRepo } from "../src/repositories/cartRepo.js";
import { productRepo } from "../src/repositories/productRepo.js";

describe("cartService.addItem", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects when existingQty + addQty exceeds stock", async () => {
    const productId = "64f000000000000000000111";
    const productObjectId = new mongoose.Types.ObjectId(productId);

    jest.spyOn(productRepo, "get").mockResolvedValue({
      _id: productObjectId,
      stock: 2,
      price: 10,
    } as any);

    const cartDoc = {
      items: [{ productId: productObjectId, qty: 2, priceSnapshot: 10 }],
    };

    jest.spyOn(cartRepo, "getOrCreate").mockResolvedValue(cartDoc as any);
    const saveSpy = jest.spyOn(cartRepo, "save").mockResolvedValue(cartDoc as any);

    await expect(
      cartService.addItem("64f0000000000000000000aa", "device-123456", productId, 1),
    ).rejects.toMatchObject({ code: "OUT_OF_STOCK" });

    expect(saveSpy).not.toHaveBeenCalled();
  });
});

describe("cartService.removeItem", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns CART_NOT_FOUND when cart does not exist", async () => {
    jest.spyOn(cartRepo, "get").mockResolvedValue(null as any);

    await expect(
      cartService.removeItem("64f0000000000000000000aa", "device-123456", "64f000000000000000000111"),
    ).rejects.toMatchObject({ code: "CART_NOT_FOUND" });
  });
});
