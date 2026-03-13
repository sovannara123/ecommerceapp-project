import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/entities/address/types";

export const addressApi = {
  async getAddresses() {
    const res = await apiClient.get("/addresses");
    return unwrap<Address[]>(res);
  },
  async createAddress(data: CreateAddressRequest) {
    const res = await apiClient.post("/addresses", data);
    return unwrap<Address>(res);
  },
  async updateAddress(id: string, data: UpdateAddressRequest) {
    const res = await apiClient.put(`/addresses/${id}`, data);
    return unwrap<Address>(res);
  },
  async deleteAddress(id: string) {
    const res = await apiClient.delete(`/addresses/${id}`);
    return unwrap<boolean>(res);
  },
  async setDefaultAddress(id: string) {
    const res = await apiClient.put(`/addresses/${id}/set-default`);
    return unwrap<Address>(res);
  },
};
