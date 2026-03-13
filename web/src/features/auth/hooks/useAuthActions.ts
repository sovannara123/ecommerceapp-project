"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/shared/api/authApi";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

export function useAuthActions() {
  const loginStore = useAuthStore((s) => s.login);
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  const register = useMutation({ mutationFn: authApi.register });
  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => loginStore(data)
  });
  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // 1 — clear Zustand auth store (tokens, user)
      clear();
      // 2 — purge ALL React Query caches so no previous-user data
      //     is served to the next session
      queryClient.clear();
    }
  });

  return { register, login, logout };
}
