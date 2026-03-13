import { notificationRepo } from "../repositories/notificationRepo.js";
import { notificationTokenRepo } from "../repositories/notificationTokenRepo.js";

export const notificationService = {
  async list(input: { userId: string; page: number; limit: number }) {
    const [items, total] = await Promise.all([
      notificationRepo.list(input.userId, input.page, input.limit),
      notificationRepo.count(input.userId),
    ]);

    return {
      items,
      page: input.page,
      limit: input.limit,
      total,
      hasMore: input.page * input.limit < total,
    };
  },

  async markRead(input: { userId: string; id: string }) {
    const notification = await notificationRepo.markRead(input.userId, input.id);
    if (!notification) {
      throw Object.assign(new Error("Notification not found"), {
        statusCode: 404,
        code: "NOTIFICATION_NOT_FOUND",
      });
    }
    return notification;
  },

  async markAllRead(userId: string) {
    await notificationRepo.markAllRead(userId);
    return true;
  },

  async registerToken(input: {
    userId: string;
    token: string;
    platform: "fcm" | "apns";
  }) {
    const token = await notificationTokenRepo.upsert(
      input.userId,
      input.token,
      input.platform,
    );
    return token;
  },
};
