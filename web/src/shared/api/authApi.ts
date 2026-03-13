import { apiClient } from "@/shared/api/client";
import { unwrap } from "@/shared/api/unwrap";
import type { AuthProfile, AuthTokens, LoginRequest, RefreshTokens, RegisterRequest } from "@/entities/auth/types";

export const authApi = {
  async register(payload: RegisterRequest) {
    const res = await apiClient.post("/auth/register", payload);
    return unwrap<AuthProfile>(res);
  },
  async login(payload: LoginRequest) {
    const res = await apiClient.post("/auth/login", payload);
    return unwrap<AuthTokens>(res);
  },
  async refresh() {
    const res = await apiClient.post("/auth/refresh", {});
    return unwrap<RefreshTokens>(res);
  },
  async logout() {
    const res = await apiClient.post("/auth/logout");
    return unwrap<boolean>(res);
  }
};
