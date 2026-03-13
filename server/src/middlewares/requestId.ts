import { nanoid } from "nanoid";
import { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const pinoRequestId = typeof (req as any).id === "string" ? (req as any).id : undefined;
    const id = pinoRequestId || req.header("x-request-id") || nanoid(10);
    req.requestId = id;
    res.setHeader("x-request-id", id);
    // Ensure all request-scoped logs include requestId.
    if (req.log) {
      req.log = req.log.child({ requestId: id });
    }
    next();
  };
}
