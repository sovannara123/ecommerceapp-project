import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fail } from "../utils/apiResponse.js";

export function errorHandler() {
  return (err: any, req: Request, res: Response, _next: NextFunction) => {
    const rid = req.requestId || (typeof (req as any).id === "string" ? (req as any).id : undefined) || "unknown";

    if (err instanceof ZodError) {
      return res.status(400).json(fail("VALIDATION_ERROR", "Invalid request", rid, err.flatten()));
    }
    if (err?.code === 11000) {
      const field = Object.keys(err?.keyPattern ?? err?.keyValue ?? {})[0] || "resource";
      return res.status(409).json(fail("CONFLICT", `${field} already exists`, rid));
    }
    if (err?.name === "CastError") {
      return res.status(400).json(fail("VALIDATION_ERROR", "Invalid identifier", rid));
    }
    const status = Number(err?.statusCode || 500);
    const code = err?.code || "INTERNAL_ERROR";
    const message = err?.message || "Something went wrong";
    req.log?.error({ err, requestId: rid }, message);
    res.status(status).json(fail(code, message, rid));
  };
}
