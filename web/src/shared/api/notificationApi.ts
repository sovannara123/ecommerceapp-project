import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationToken,
} from "@/entities/notification/types";

export const notificationApi = {
  async getNotifications(page = 1) {
    const res = await apiClient.get("/notifications", { params: { page } });
    return unwrap<NotificationListResponse>(res);
  },
  async markRead(id: string) {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return unwrap<NotificationItem>(res);
  },
  async markAllRead() {
    const res = await apiClient.put("/notifications/read-all");
    return unwrap<boolean>(res);
  },
  async registerToken(token: string) {
    const res = await apiClient.post("/notifications/register-token", {
      token,
      platform: "fcm",
    });
    return unwrap<NotificationToken>(res);
  },
};
