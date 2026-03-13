"use client";

import { useEffect } from "react";
import { authApi } from "@/shared/api/authApi";
import { normalizeApiError } from "@/shared/api/error";
import { profileApi } from "@/shared/api/profileApi";
import { registerRefreshHandler } from "@/shared/api/client";
import { clearSession, registerSessionHandler } from "@/shared/api/session";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

export function useAuthSessionBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);
  const bootstrapSession = useAuthStore((s) => s.bootstrapSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    registerSessionHandler({
      get: () => ({ accessToken }),
      set: (tokens) => setTokens(tokens),
      clear: () => clear()
    });
  }, [accessToken, setTokens, clear]);

  useEffect(() => {
    registerRefreshHandler(async () => {
      try {
        const tokens = await authApi.refresh();
        setTokens(tokens);
        try {
          const profile = await profileApi.getProfile();
          useAuthStore.setState({
            user: {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role === "admin" ? "admin" : "customer"
            }
          });
        } catch (_) {
          // Keep existing user state if profile fetch fails during refresh.
        }
        return tokens;
      } catch (error) {
        const normalized = normalizeApiError(error);
        if (normalized.code === "INVALID_REFRESH" || normalized.code === "SESSION_NOT_FOUND" || normalized.code === "REFRESH_REUSED") {
          clearSession();
        }
        throw error;
      }
    });
  }, [setTokens]);

  useEffect(() => {
    let active = true;
    bootstrapSession().then(() => {
      if (active) setHydrated();
    });

    return () => {
      active = false;
    };
  }, [bootstrapSession, setHydrated]);
}
