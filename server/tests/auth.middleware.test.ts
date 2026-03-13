import { jest } from "@jest/globals";

import { requireAuth } from "../src/middlewares/auth.js";
import { signAccessToken } from "../src/utils/jwt.js";
import { config } from "../src/config.js";

describe("requireAuth middleware", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns a generic invalid token error message", async () => {
    const middleware = requireAuth();
    const req: any = {
      requestId: "req-auth-invalid",
      header(name: string) {
        if (name === "authorization") return "Bearer invalid.token.value";
        return undefined;
      },
    };
    const res: any = {
      statusCode: 200,
      body: undefined,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
    };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body?.error).toBe("UNAUTHORIZED");
    expect(res.body?.message).toBe("Invalid or expired token");
    expect(res.body?.requestId).toBe("req-auth-invalid");
  });

  it("returns 503 when auth state store is unavailable", async () => {
    const middleware = requireAuth();
    const accessToken = await signAccessToken(
      {
        sub: "64f000000000000000000001",
        role: "customer",
        jti: "jti-123",
      },
      config.accessTokenTtlSeconds,
    );

    const req: any = {
      requestId: "req-auth-503",
      header(name: string) {
        if (name === "authorization") return `Bearer ${accessToken}`;
        return undefined;
      },
    };
    const res: any = {
      statusCode: 200,
      body: undefined,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.body = payload;
        return this;
      },
    };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(503);
    expect(res.body?.error).toBe("AUTH_STATE_UNAVAILABLE");
  });
});
