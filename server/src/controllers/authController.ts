import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService.js";
import { fail, ok } from "../utils/apiResponse.js";
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  deviceSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "../validators/auth.js";

function getDeviceId(req: Request) {
  const deviceId = req.header("x-device-id") || "";
  deviceSchema.parse({ deviceId });
  return deviceId;
}

export const authController = {
  async register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body);
    const user = await authService.register(body);
    res.json(ok(user));
  },
  async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body);
    const deviceId = getDeviceId(req);
    const out = await authService.login({ ...body, deviceId });
    res.cookie("refreshToken", out.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const response = { ...out };
    delete response.refreshToken;
    res.json(ok(response));
  },
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json(fail("NO_TOKEN", "Refresh token missing", req.requestId));
    }
    const body = refreshSchema.parse({ refreshToken });
    const deviceId = getDeviceId(req);
    const out = await authService.refresh({ ...body, deviceId });
    res.cookie("refreshToken", out.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const response = { ...out };
    delete response.refreshToken;
    res.json(ok(response));
  },
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        typeof req.body?.refreshToken === "string"
          ? req.body.refreshToken
          : "";
      if (!refreshToken.trim()) {
        return res.status(422).json(
          fail("VALIDATION_ERROR", "Missing required field: refreshToken", req.requestId),
        );
      }

      const body = refreshSchema.parse({ refreshToken });
      const deviceId = getDeviceId(req);
      const out = await authService.refresh({ ...body, deviceId });

      res.cookie("refreshToken", out.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const response = { ...out };
      delete response.refreshToken;
      res.json(ok(response));
    } catch (error) {
      next(error);
    }
  },
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const email =
        typeof req.body?.email === "string" ? req.body.email : "";
      if (!email.trim()) {
        return res.status(422).json(
          fail("VALIDATION_ERROR", "Missing required field: email", req.requestId),
        );
      }

      const body = forgotPasswordSchema.parse({ email });
      await authService.forgotPassword(body);

      res.json({
        success: true,
        message: "If an account exists, a reset code has been sent.",
      });
    } catch (error) {
      next(error);
    }
  },
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const email =
        typeof req.body?.email === "string" ? req.body.email : "";
      const otp = typeof req.body?.otp === "string" ? req.body.otp : "";

      if (!email.trim() || !otp.trim()) {
        return res.status(422).json(
          fail(
            "VALIDATION_ERROR",
            "Missing required fields: email, otp",
            req.requestId,
          ),
        );
      }

      const body = verifyOtpSchema.parse({ email, otp });
      const out = await authService.verifyOtp(body);

      res.json(ok({ resetToken: out.resetToken }));
    } catch (error) {
      next(error);
    }
  },
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const resetToken =
        typeof req.body?.resetToken === "string" ? req.body.resetToken : "";
      const newPassword =
        typeof req.body?.newPassword === "string" ? req.body.newPassword : "";

      if (!resetToken.trim() || !newPassword.trim()) {
        return res.status(422).json(
          fail(
            "VALIDATION_ERROR",
            "Missing required fields: resetToken, newPassword",
            req.requestId,
          ),
        );
      }

      const body = resetPasswordSchema.parse({ resetToken, newPassword });
      await authService.resetPassword(body);

      res.json({ success: true, message: "Password reset successfully." });
    } catch (error) {
      next(error);
    }
  },
  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        return res.status(401).json(fail("UNAUTHORIZED", "Missing token", req.requestId));
      }

      await authService.deleteAccount({
        userId,
        accessTokenJti: (req as any).tokenJti,
        accessTokenExp: (req as any).tokenExp,
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
      });

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
  async logout(req: Request, res: Response) {
    const deviceId = getDeviceId(req);
    const userId = req.user!.sub;
    await authService.logout({
      userId,
      deviceId,
      ...(req as any).tokenJti
        ? { jti: (req as any).tokenJti, exp: (req as any).tokenExp }
        : {},
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
    });
    res.json(ok(true));
  },
};
