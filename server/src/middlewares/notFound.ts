import { Request, Response, NextFunction } from "express";
import { fail } from "../utils/apiResponse.js";

export function notFound() {
  return (req: Request, res: Response, _next: NextFunction) => {
    const rid = req.requestId || (typeof (req as any).id === "string" ? (req as any).id : undefined) || "unknown";
    req.log?.warn({ requestId: rid, method: req.method, path: req.originalUrl }, "Route not found");
    res.status(404).json(fail("NOT_FOUND", "Route not found", rid));
  };
}
