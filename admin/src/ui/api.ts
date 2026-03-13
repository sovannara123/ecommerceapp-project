import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  withCredentials: true,
});

export function setAuth(accessToken: string | null, deviceId: string) {
  setAccessToken(accessToken);
  api.defaults.headers.common["x-device-id"] = deviceId;
}

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = getAccessToken();
  if (token) config.headers.authorization = `Bearer ${token}`;
  else delete config.headers.authorization;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error?.response?.status;
    const url = original?.url || "";
    if (!original || original._retry || status !== 401 || url.includes("/auth/login") || url.includes("/auth/refresh")) {
      throw error;
    }

    original._retry = true;

    try {
      const refreshRes = await api.post("/auth/refresh", {});
      const newToken: string | undefined = refreshRes?.data?.data?.accessToken;
      if (!newToken) {
        clearAccessToken();
        window.location.href = "/login";
        throw error;
      }
      setAccessToken(newToken);
      return api(original);
    } catch (refreshError) {
      clearAccessToken();
      window.location.href = "/login";
      throw refreshError;
    }
  }
);
