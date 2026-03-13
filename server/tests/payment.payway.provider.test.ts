import axios from "axios";
import { jest } from "@jest/globals";

import { config } from "../src/config.js";
import { PayWayProvider } from "../src/services/paymentProviders/PayWayProvider.js";

describe("PayWayProvider createPayment", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    config.payway.referer = "http://localhost";
  });

  it("uses configured Referer header for PayWay purchase calls", async () => {
    config.payway.baseUrl = "https://payway.example.com";
    config.payway.merchantId = "merchant-id";
    config.payway.publicKey = "public-key";
    config.payway.referer = "https://merchant.example.com";

    const axiosSpy = jest.spyOn(axios, "post").mockResolvedValue({
      data: {
        abapay_deeplink: "payway://deeplink",
        qrString: "qr",
        app_store: "ios",
        play_store: "android",
      },
    } as any);

    const provider = new PayWayProvider();
    await provider.createPayment({
      tranId: "tran123456",
      amount: 100,
      currency: "USD",
      customer: {
        firstname: "Alice",
        lastname: "Example",
        email: "alice@example.com",
        phone: "012345678",
      },
      itemsBase64: Buffer.from(JSON.stringify([{ name: "Item", quantity: "1", price: "100.00" }]), "utf8").toString("base64"),
      paymentOption: "abapay_deeplink",
      returnUrlBase64: "",
      cancelUrl: "",
      continueSuccessUrl: "",
      returnParams: "order-id",
    });

    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(axiosSpy.mock.calls[0][2]?.headers?.Referer).toBe("https://merchant.example.com");
  });
});
