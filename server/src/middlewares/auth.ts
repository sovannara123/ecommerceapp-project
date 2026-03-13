import { Request, Response, NextFunction } from "express";
import { fail } from "../utils/apiResponse.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { isAccessJtiBlacklisted } from "../utils/tokenBlacklist.js";

export type AuthUser = { sub: string; role: "customer" | "admin" };
export const authMiddlewareDeps = {
  verifyAccessToken,
  isAccessJtiBlacklisted,
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export function requireAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const h = req.header("authorization");
    if (!h?.startsWith("Bearer ")) return res.status(401).json(fail("UNAUTHORIZED", "Missing token", req.requestId));
    const token = h.slice("Bearer ".length);
    try {
      const payload = await authMiddlewareDeps.verifyAccessToken(token);
      if (await authMiddlewareDeps.isAccessJtiBlacklisted(payload.jti)) {
        return res.status(401).json(fail("UNAUTHORIZED", "Token revoked", req.requestId));
      }
      req.user = { sub: payload.sub, role: payload.role };
      (req as any).tokenJti = payload.jti;
      (req as any).tokenExp = payload.exp;
      next();
    } catch (err) {
      if ((err as any)?.code === "AUTH_STATE_UNAVAILABLE") {
        return res.status(503).json(fail("AUTH_STATE_UNAVAILABLE", "Authentication state unavailable", req.requestId));
      }
      return res.status(401).json(fail("UNAUTHORIZED", "Invalid or expired token", req.requestId));
    }
  };
}

export function requireRole(role: AuthUser["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json(fail("UNAUTHORIZED", "Missing token", req.requestId));
    if (req.user.role !== role) return res.status(403).json(fail("FORBIDDEN", "Insufficient permissions", req.requestId));
    next();
  };
}
