import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/shared/config/env";
import { clearSession, setSessionTokens } from "@/shared/api/session";
import { getOrCreateDeviceId } from "@/shared/lib/device";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import type { RefreshTokens } from "@/entities/auth/types";

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export type RefreshHandler = () => Promise<RefreshTokens>;

let refreshHandler: RefreshHandler | null = null;

export function registerRefreshHandler(handler: RefreshHandler) {
  refreshHandler = handler;
}

function flushRefreshQueue(nextToken: string | null) {
  refreshQueue.forEach((resolve) => resolve(nextToken));
  refreshQueue = [];
}

function applyAuthHeaders(config: InternalAxiosRequestConfig) {
  const token = useAuthStore.getState().accessToken;
  const headers = config.headers;
  headers.set("x-device-id", getOrCreateDeviceId());
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
}

function shouldAttemptRefresh(error: AxiosError) {
  const status = error.response?.status;
  const code = (error.response?.data as { error?: string } | undefined)?.error;
  const url = error.config?.url || "";
  if (url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/refresh")) return false;
  return status === 401 && code === "UNAUTHORIZED";
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Client": "northstar-web/1.0.0"
  }
});

apiClient.interceptors.request.use(applyAuthHeaders);

apiClient.interceptors.response.use(
  (response) => {
    const requestId = response.headers["x-request-id"] as string | undefined;
    if (process.env.NODE_ENV === "development" && requestId) {
      console.debug(`[api] ${response.config.method?.toUpperCase()} ${response.config.url} requestId=${requestId}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || original._retry || !shouldAttemptRefresh(error) || !refreshHandler) {
      throw error;
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          original.headers.set("Authorization", `Bearer ${token}`);
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshed = await refreshHandler();
      setSessionTokens(refreshed);
      flushRefreshQueue(refreshed.accessToken);
      original.headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
      return apiClient(original);
    } catch (refreshError) {
      flushRefreshQueue(null);
      clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
);
