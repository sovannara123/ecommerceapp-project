import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type {
  CreateOrderRequest,
  Order,
  OrderTracking,
} from "@/entities/order/types";
import type { OrderStatus } from "@/entities/order/constants";

export const orderApi = {
  async create(payload: CreateOrderRequest) {
    const res = await apiClient.post("/orders", payload);
    return unwrap<Order>(res);
  },
  async listMine() {
    const res = await apiClient.get("/orders/mine");
    return unwrap<Order[]>(res);
  },
  async getMine(id: string) {
    const res = await apiClient.get(`/orders/mine/${id}`);
    return unwrap<Order>(res);
  },
  async listAdmin() {
    const res = await apiClient.get("/orders/admin/all");
    return unwrap<Order[]>(res);
  },
  async updateStatus(id: string, status: OrderStatus) {
    const res = await apiClient.patch(`/orders/admin/${id}/status`, { status });
    return unwrap<Order>(res);
  },
  async cancelOrder(id: string, reason?: string) {
    const res = await apiClient.put(`/orders/${id}/cancel`, {
      cancelReason: reason ?? "",
    });
    return unwrap<Order>(res);
  },
  async requestReturn(id: string, reason: string) {
    const res = await apiClient.post(`/orders/${id}/return`, {
      returnReason: reason,
    });
    return unwrap<Order>(res);
  },
  async trackOrder(id: string) {
    const res = await apiClient.get(`/orders/${id}/track`);
    return unwrap<OrderTracking>(res);
  },
};
