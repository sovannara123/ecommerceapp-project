"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = parseInt(
  process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES || "30",
  10
) * 60 * 1000;

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"] as const;

export function useInactivityTimeout(): void {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    clearAuth();
    router.push("/login?reason=session_expired");
  }, [clearAuth, router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    if (!accessToken) return; // only track when logged in

    // Set initial timer
    resetTimer();

    // Reset on user activity
    const handler = () => resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      document.addEventListener(event, handler, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) =>
        document.removeEventListener(event, handler)
      );
    };
  }, [accessToken, resetTimer]);
}
