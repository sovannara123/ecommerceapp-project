export const PAYMENT_PROVIDER = {
  payway: "payway",
  stripe: "stripe"
} as const;

export const PAYWAY_PAYMENT_OPTION = {
  abaDeeplink: "abapay_deeplink",
  cards: "cards"
} as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDER)[keyof typeof PAYMENT_PROVIDER];
