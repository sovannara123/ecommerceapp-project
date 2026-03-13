import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const notificationIdParamSchema = z.object({
  id: objectIdSchema,
});

export const registerNotificationTokenSchema = z.object({
  token: z.string().trim().min(1),
  platform: z.enum(["fcm", "apns"]),
});
