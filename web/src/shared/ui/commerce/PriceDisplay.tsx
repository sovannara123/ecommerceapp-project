import type { Currency } from "@/entities/product/types";

const currencyFmt = {
  USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
  KHR: new Intl.NumberFormat("en-US", { style: "currency", currency: "KHR", maximumFractionDigits: 0 })
};

export function PriceDisplay({ amount, currency }: { amount: number; currency: Currency }) {
  return <span>{currencyFmt[currency].format(amount)}</span>;
}
