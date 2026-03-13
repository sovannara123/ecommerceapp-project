import { Request, Response, NextFunction } from "express";

/**
 * Middleware that captures the raw request body as a Buffer
 * on req.rawBody for webhook signature verification.
 * Must be mounted BEFORE express.json() on webhook routes.
 */
export function captureRawBody(req: Request, _res: Response, next: NextFunction): void {
  if (Buffer.isBuffer((req as any).body)) {
    req.rawBody = (req as any).body;
    next();
    return;
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  req.on("end", () => {
    req.rawBody = Buffer.concat(chunks);
    next();
  });
  req.on("error", (err) => next(err));
}
