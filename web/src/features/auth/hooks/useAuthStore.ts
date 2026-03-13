"use client";

import { create } from "zustand";
import type { AuthProfile, AuthTokens, RefreshTokens } from "@/entities/auth/types";
import { authApi } from "@/shared/api/authApi";
import { profileApi } from "@/shared/api/profileApi";

function toAuthProfile(profile: { id: string; name: string; email: string; role: string }): AuthProfile {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role === "admin" ? "admin" : "customer"
  };
}

type AuthState = {
  user: AuthProfile | null;
  accessToken: string | null;
  expiresAt: string | null;
  hydrated: boolean;
  setHydrated: () => void;
  setTokens: (tokens: RefreshTokens) => void;
  bootstrapSession: () => Promise<void>;
  login: (payload: AuthTokens) => void;
  clearAuth: () => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  (set) => ({
    user: null,
    accessToken: null,
    expiresAt: null,
    hydrated: false,
    setHydrated: () => set({ hydrated: true }),
    setTokens: (tokens) => set({ accessToken: tokens.accessToken, expiresAt: tokens.expiresAt }),
    /**
     * Called once on app mount (AuthProvider) and after every silent
     * refresh. Re-fetches the user profile so the store is never in a
     * "has token but no user" state.
     */
    bootstrapSession: async () => {
      try {
        const tokens = await authApi.refresh();
        const profile = await profileApi.getProfile();
        set({
          accessToken: tokens.accessToken,
          expiresAt: tokens.expiresAt,
          user: toAuthProfile(profile),
        });
      } catch {
        // refresh failed -> force unauthenticated
        set({ accessToken: null, expiresAt: null, user: null });
      }
    },
    login: (payload) => set({ user: payload.user, accessToken: payload.accessToken, expiresAt: payload.expiresAt }),
    clearAuth: () => set({ user: null, accessToken: null, expiresAt: null }),
    clear: () => set({ user: null, accessToken: null, expiresAt: null })
  })
);
