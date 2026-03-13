export const ORDER_STATUS = {
  pendingPayment: "pending_payment",
  paid: "paid",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled"
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
