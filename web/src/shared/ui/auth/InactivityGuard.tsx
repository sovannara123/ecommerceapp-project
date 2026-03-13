"use client";

import { useInactivityTimeout } from "@/shared/hooks/useInactivityTimeout";

export function InactivityGuard({ children }: { children: React.ReactNode }) {
  useInactivityTimeout();
  return <>{children}</>;
}
