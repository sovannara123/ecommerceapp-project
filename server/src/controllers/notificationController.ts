import { Request, Response } from "express";
import { ok } from "../utils/apiResponse.js";
import { notificationService } from "../services/notificationService.js";
import {
  listNotificationsSchema,
  notificationIdParamSchema,
  registerNotificationTokenSchema,
} from "../validators/notification.js";

export const notificationController = {
  async list(req: Request, res: Response) {
    const query = listNotificationsSchema.parse(req.query);
    const out = await notificationService.list({
      userId: req.user!.sub,
      page: query.page,
      limit: query.limit,
    });
    res.json(ok(out));
  },
  async markRead(req: Request, res: Response) {
    const { id } = notificationIdParamSchema.parse(req.params);
    const out = await notificationService.markRead({ userId: req.user!.sub, id });
    res.json(ok(out));
  },
  async markAllRead(req: Request, res: Response) {
    await notificationService.markAllRead(req.user!.sub);
    res.json(ok(true));
  },
  async registerToken(req: Request, res: Response) {
    const body = registerNotificationTokenSchema.parse(req.body);
    const out = await notificationService.registerToken({
      userId: req.user!.sub,
      token: body.token,
      platform: body.platform,
    });
    res.json(ok(out));
  },
};
