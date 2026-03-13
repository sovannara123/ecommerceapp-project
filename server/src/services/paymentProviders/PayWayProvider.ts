import axios from "axios";
import crypto from "crypto";
import { config } from "../../config.js";

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;",
};

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

function hmacSha512Base64(message: string, key: string) {
  return crypto.createHmac("sha512", key).update(message).digest("base64");
}

// Hash sequence for Purchase API per PayWay v2 doc:
// req_time + merchant_id + tran_id + amount + items + shipping + ctid + pwt + firstname + lastname + email + phone + type + payment_option + return_url + cancel_url + continue_success_url + return_deeplink + currency + custom_fields + return_params
// (Empty string for omitted params, but keep sequence.)
function buildPurchaseHashString(params: Record<string, any>) {
  const seq = [
    "req_time","merchant_id","tran_id","amount","items","shipping","ctid","pwt",
    "firstname","lastname","email","phone","type","payment_option","return_url","cancel_url","continue_success_url",
    "return_deeplink","currency","custom_fields","return_params"
  ];
  return seq.map(k => (params[k] ?? "")).join("");
}

function nowReqTimeUTC() {
  const d = new Date();
  const pad = (n:number)=> String(n).padStart(2,"0");
  // PayWay expects YYYYmmddHis (UTC)
  const y=d.getUTCFullYear();
  const m=pad(d.getUTCMonth()+1);
  const day=pad(d.getUTCDate());
  const hh=pad(d.getUTCHours());
  const mm=pad(d.getUTCMinutes());
  const ss=pad(d.getUTCSeconds());
  return `${y}${m}${day}${hh}${mm}${ss}`;
}

export class PayWayProvider {
  baseUrl = config.payway.baseUrl;
  merchantId = config.payway.merchantId;
  publicKey = config.payway.publicKey;

  async createPayment(input: any) {
    const req_time = nowReqTimeUTC();

    const payload: Record<string, any> = {
      req_time,
      merchant_id: this.merchantId,
      tran_id: input.tranId,
      firstname: input.customer.firstname,
      lastname: input.customer.lastname,
      email: input.customer.email,
      phone: input.customer.phone,
      amount: input.amount,
      currency: input.currency,
      type: "purchase",
      payment_option: input.paymentOption ?? "abapay_deeplink",
      items: input.itemsBase64,
      shipping: 0,
      return_url: input.returnUrlBase64,
      cancel_url: input.cancelUrl,
      continue_success_url: input.continueSuccessUrl,
      return_deeplink: "", // optional; can pass base64 JSON for deep link template
      custom_fields: input.customFieldsBase64 ?? "",
      return_params: input.returnParams ?? "",
      view_type: input.paymentOption === "cards" ? "native_app" : undefined,
    };

    const hashStr = buildPurchaseHashString(payload);
    payload.hash = hmacSha512Base64(hashStr, this.publicKey);

    const url = `${this.baseUrl}/api/payment-gateway/v1/payments/purchase`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.payway.referer) {
      headers.Referer = config.payway.referer;
    }
    // purchase uses form-data per doc; JSON also works in newer API. We'll send JSON.
    const res = await axios.post(url, payload, { headers });
    const data = res.data;

    // If payment_option=abapay_deeplink, response contains qrString and abapay_deeplink.
    if (payload.payment_option === "abapay_deeplink" && data?.abapay_deeplink) {
      return {
        provider: "payway",
        mode: "deeplink",
        tranId: input.tranId,
        qrString: data.qrString,
        deeplink: data.abapay_deeplink,
        appStore: data.app_store,
        playStore: data.play_store
      } as const;
    }

    // For card checkout, PayWay expects you to render returned HTML/URL. Some responses contain "checkout_qr_url" etc.
    // To stay frontend-agnostic, return a small HTML that auto-posts to PayWay checkout endpoint.
    const formAction = `${this.baseUrl}/purchase`; // hosted page endpoint; merchant may need configured domain
    const fields = Object.entries(payload)
      .filter(([_,v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(String(v))}" />`)
      .join("");

    const checkoutHtml = `<!doctype html><html><body>
      <form id="f" method="POST" action="${escapeHtml(formAction)}">
        ${fields}
      </form>
      <script>document.getElementById('f').submit();</script>
    </body></html>`;

    return { provider: "payway", mode: "web", tranId: input.tranId, checkoutHtml } as const;
  }

  async verifyAndFinalizePayment(input: { tranId: string }) {
    const req_time = nowReqTimeUTC();
    // Check transaction hash: req_time + merchant_id + tran_id
    const hashStr = `${req_time}${this.merchantId}${input.tranId}`;
    const hash = hmacSha512Base64(hashStr, this.publicKey);

    const url = `${this.baseUrl}/api/payment-gateway/v1/payments/check-transaction`;
    const res = await axios.post(url, { req_time, merchant_id: this.merchantId, tran_id: input.tranId, hash }, { headers: { "Content-Type": "application/json" } });
    const data = res.data;

    // status: 0 approved; 2 pending; etc.
    const approved = Number(data?.status) === 0 || data?.description === "approved";
    return { status: approved ? "paid" : "not_paid", apv: data?.apv, raw: data };
  }
}
