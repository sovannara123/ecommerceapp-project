import { jest } from "@jest/globals";

import { orderController } from "../src/controllers/orderController.js";
import { orderService } from "../src/services/orderService.js";
import { invoke } from "./helpers/httpMock.js";

function withHeaders(headers: Record<string, string>) {
  return (name: string) => headers[name.toLowerCase()] || headers[name] || "";
}

describe("order validation", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 400 for invalid phone format", async () => {
    const createSpy = jest.spyOn(orderService, "createFromCart");

    const res = await invoke(orderController.create, {
      body: {
        address: {
          fullName: "User Example",
          phone: "abc-123",
          line1: "Street 1",
          city: "Phnom Penh",
          province: "Phnom Penh",
          postalCode: "12000",
        },
      },
      user: { sub: "64f000000000000000000001", role: "customer" },
      header: withHeaders({ "x-device-id": "device-123456" }),
    } as any);

    expect(res.statusCode).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(createSpy).not.toHaveBeenCalled();
  });
});
