import { jest } from "@jest/globals";

import { cartController } from "../src/controllers/cartController.js";
import { cartService } from "../src/services/cartService.js";
import { invoke } from "./helpers/httpMock.js";

function withHeaders(headers: Record<string, string>) {
  return (name: string) => headers[name.toLowerCase()] || headers[name] || "";
}

describe("cart 404 behavior", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 404 CART_NOT_FOUND when remove is requested and cart does not exist", async () => {
    jest.spyOn(cartService, "removeItem").mockRejectedValue(
      Object.assign(new Error("Cart not found"), { statusCode: 404, code: "CART_NOT_FOUND" }),
    );

    const res = await invoke(cartController.remove, {
      body: { productId: "64f000000000000000000123" },
      user: { sub: "64f000000000000000000001", role: "customer" },
      header: withHeaders({ "x-device-id": "device-123456" }),
    } as any);

    expect(res.statusCode).toBe(404);
    expect(res.body?.error).toBe("CART_NOT_FOUND");
  });

  it("returns 404 CART_NOT_FOUND when update is requested and cart does not exist", async () => {
    jest.spyOn(cartService, "updateQty").mockRejectedValue(
      Object.assign(new Error("Cart not found"), { statusCode: 404, code: "CART_NOT_FOUND" }),
    );

    const res = await invoke(cartController.update, {
      body: { productId: "64f000000000000000000123", qty: 1 },
      user: { sub: "64f000000000000000000001", role: "customer" },
      header: withHeaders({ "x-device-id": "device-123456" }),
    } as any);

    expect(res.statusCode).toBe(404);
    expect(res.body?.error).toBe("CART_NOT_FOUND");
  });

  it("returns 404 when clear is requested and cart does not exist", async () => {
    jest.spyOn(cartService, "clear").mockResolvedValue(null as any);

    const res = await invoke(cartController.clear, {
      user: { sub: "64f000000000000000000001", role: "customer" },
      header: withHeaders({ "x-device-id": "device-123456" }),
    } as any);

    expect(res.statusCode).toBe(404);
    expect(res.body?.error).toBe("CART_NOT_FOUND");
  });
});
