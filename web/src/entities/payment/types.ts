export type CreatePaywayRequest = {
  orderId: string;
  paymentOption?: string;
};

export type CreateStripeIntentRequest = {
  orderId: string;
};

export type PaywayCreateResponse = {
  provider: "payway";
  mode: "deeplink" | "web";
  tranId: string;
  qrString?: string;
  deeplink?: string;
  appStore?: string;
  playStore?: string;
  checkoutHtml?: string;
};

export type StripeCreateResponse = {
  provider: "stripe";
  clientSecret: string;
};
