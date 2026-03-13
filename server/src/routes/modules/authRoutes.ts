import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../../controllers/authController.js";
import { requireAuth } from "../../middlewares/auth.js";
import { normalizeEmail } from "../../utils/email.js";

export const authRouter = Router();

export function buildLoginRateLimitKey(req: { ip?: string; body?: unknown }) {
  const rawEmail =
    typeof (req.body as any)?.email === "string"
      ? (req.body as any).email
      : "noemail";
  return `${req.ip || "unknown"}:${normalizeEmail(rawEmail)}`;
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => buildLoginRateLimitKey(req),
});

authRouter.post("/register", (req, res, next) =>
  authController.register(req, res).catch(next),
);
authRouter.post("/login", loginLimiter, (req, res, next) =>
  authController.login(req, res).catch(next),
);
authRouter.post("/refresh", (req, res, next) =>
  authController.refresh(req, res).catch(next),
);
authRouter.post("/refresh-token", (req, res, next) =>
  authController.refreshToken(req, res, next),
);
authRouter.post("/forgot-password", (req, res, next) =>
  authController.forgotPassword(req, res, next),
);
authRouter.post("/verify-otp", (req, res, next) =>
  authController.verifyOtp(req, res, next),
);
authRouter.post("/reset-password", (req, res, next) =>
  authController.resetPassword(req, res, next),
);
authRouter.delete("/delete-account", requireAuth(), (req, res, next) =>
  authController.deleteAccount(req, res, next),
);
authRouter.post("/logout", requireAuth(), (req, res, next) =>
  authController.logout(req, res).catch(next),
);
