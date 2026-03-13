import { Request, Response } from "express";
import { ok } from "../utils/apiResponse.js";
import { userService } from "../services/userService.js";
import { changePasswordSchema, updateProfileSchema } from "../validators/user.js";

type RequestWithFile = Request & { file?: { filename: string } };

export class UserController {
  async getProfile(req: Request, res: Response) {
    const profile = await userService.getProfile(req.user!.sub);
    res.json(ok(profile));
  }

  async updateProfile(req: Request, res: Response) {
    const body = updateProfileSchema.parse(req.body);
    const profile = await userService.updateProfile(req.user!.sub, body);
    res.json(ok(profile));
  }

  async changePassword(req: Request, res: Response) {
    const body = changePasswordSchema.parse(req.body);
    await userService.changePassword(req.user!.sub, body);
    res.json(ok(true));
  }

  async uploadAvatar(req: Request, res: Response) {
    const file = (req as RequestWithFile).file;
    if (!file) {
      throw Object.assign(new Error("Avatar file is required"), {
        statusCode: 422,
        code: "VALIDATION_ERROR",
      });
    }

    const out = await userService.uploadAvatar(req.user!.sub, file.filename);
    res.json(ok(out));
  }
}

export const userController = new UserController();
