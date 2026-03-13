export const ORDER_STATUS = {
  pendingPayment: "pending_payment",
  paid: "paid",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_PROVIDER = {
  payway: "payway",
  stripe: "stripe",
} as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];

export const PAYWAY_PAYMENT_OPTION = {
  abaDeeplink: "abapay_deeplink",
  cards: "cards",
} as const;
