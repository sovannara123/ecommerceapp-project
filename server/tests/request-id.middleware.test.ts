import { jest } from "@jest/globals";

import { requestId } from "../src/middlewares/requestId.js";

describe("requestId middleware", () => {
  it("binds requestId to request logger child", () => {
    const child = jest.fn().mockReturnValue({});
    const req: any = {
      id: "req-from-pino",
      header: jest.fn().mockReturnValue(undefined),
      log: { child },
    };
    const res: any = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    requestId()(req, res, next);

    expect(req.requestId).toBe("req-from-pino");
    expect(res.setHeader).toHaveBeenCalledWith("x-request-id", "req-from-pino");
    expect(child).toHaveBeenCalledWith({ requestId: "req-from-pino" });
    expect(next).toHaveBeenCalled();
  });
});
