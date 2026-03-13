import type { Request, Response } from "express";

import { errorHandler } from "../../src/middlewares/errorHandler.js";

type Handler = (req: Request, res: Response) => void | Promise<void> | Response | Promise<Response | undefined>;

export async function invoke(handler: Handler, req: Partial<Request>) {
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

  (req as any).requestId = (req as any).requestId || "test-request-id";
  const baseLogger = {
    info() {},
    error() {},
    warn() {},
    debug() {},
  };
  (req as any).log = {
    ...baseLogger,
    ...((req as any).log || {}),
  };

  try {
    await handler(req as Request, res as Response);
  } catch (err) {
    const middleware = errorHandler();
    middleware(err, req as Request, res as Response, () => {});
  }

  return res as { statusCode: number; body: any };
}
