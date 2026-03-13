export type CreatePaymentResult =
  | { provider: "payway"; mode: "deeplink"; tranId: string; qrString: string; deeplink: string; appStore: string; playStore: string }
  | { provider: "payway"; mode: "web"; tranId: string; checkoutHtml: string }
  | { provider: "stripe"; clientSecret: string };

export interface PaymentProvider {
  createPayment(input: {
    orderId: string;
    tranId: string;
    amount: number;
    currency: "USD" | "KHR";
    customer: { firstname: string; lastname: string; email: string; phone: string };
    itemsBase64: string;
    paymentOption: string;
    returnUrlBase64: string;
    cancelUrl: string;
    continueSuccessUrl: string;
    customFieldsBase64?: string;
    returnParams?: string;
  }): Promise<CreatePaymentResult>;

  verifyAndFinalizePayment(input: { tranId: string; orderId?: string }): Promise<{ status: "paid" | "not_paid"; apv?: string; raw?: any }>;
}
