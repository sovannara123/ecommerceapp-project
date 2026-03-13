import type { Currency } from "@/entities/product/types";
import type { OrderStatus } from "@/entities/order/constants";
import type { PaymentProvider } from "@/entities/payment/constants";

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  province: string;
  postalCode?: string;
};

export type OrderItem = {
  productId: string;
  title: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  _id: string;
  userId: string;
  deviceId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  address: Address;
  paymentProvider: PaymentProvider;
  paywayTranId?: string;
  paywayApv?: string;
  cancelledAt?: string;
  cancelReason?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  returnRequested?: boolean;
  returnReason?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderTrackingEvent = {
  status: OrderStatus;
  timestamp: string;
  note: string;
};

export type OrderTracking = {
  statusHistory: OrderTrackingEvent[];
  trackingNumber?: string;
};

export type CreateOrderRequest = {
  address: Address;
  shippingFee?: number;
  currency?: Currency;
  paymentProvider?: PaymentProvider;
  paymentOption?: string;
};
