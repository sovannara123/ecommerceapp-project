import { authController } from "../src/controllers/authController.js";
import { cartController } from "../src/controllers/cartController.js";
import { orderController } from "../src/controllers/orderController.js";
import { invoke } from "./helpers/httpMock.js";

function withHeaders(headers: Record<string, string>) {
  return (name: string) => headers[name.toLowerCase()] || headers[name] || "";
}

describe("security validation", () => {
  it("returns 400 for invalid productId in cart/add", async () => {
    const res = await invoke(cartController.add, {
      body: { productId: "abc", qty: 1 },
      user: { sub: "64f000000000000000000001", role: "customer" },
      header: withHeaders({ "x-device-id": "device-123456" }),
    } as any);

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("VALIDATION_ERROR");
    expect((res.body as any)?.requestId).toBeDefined();
  });

  it("returns 400 for invalid id in /orders/mine/:id", async () => {
    const res = await invoke(orderController.getMine, {
      params: { id: "abc" },
      user: { sub: "64f000000000000000000001", role: "customer" },
    } as any);

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("VALIDATION_ERROR");
  });

  it("returns 400 for invalid admin order status", async () => {
    const res = await invoke(orderController.adminUpdateStatus, {
      params: { id: "64f000000000000000000123" },
      body: { status: "invalid_status" },
      user: { sub: "64f0000000000000000000aa", role: "admin" },
    } as any);

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("VALIDATION_ERROR");
  });

  it("returns 401 INVALID_REFRESH for malformed refresh token", async () => {
    const res = await invoke(authController.refresh, {
      body: { refreshToken: "abc.def0123456789abc" },
      header: withHeaders({ "x-device-id": "device-123456" }),
    } as any);

    expect(res.statusCode).toBe(401);
    expect((res.body as any)?.error).toBe("INVALID_REFRESH");
  });
});
