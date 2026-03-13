export type NotificationType = "order" | "promo" | "system";
export type NotificationPlatform = "fcm" | "apns";

export type NotificationItem = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationListResponse = {
  items: NotificationItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type RegisterNotificationTokenRequest = {
  token: string;
  platform: NotificationPlatform;
};

export type NotificationToken = {
  _id: string;
  userId: string;
  token: string;
  platform: NotificationPlatform;
  createdAt?: string;
  updatedAt?: string;
};
