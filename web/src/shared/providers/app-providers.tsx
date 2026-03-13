"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { AppQueryProvider } from "@/shared/providers/query-provider";
import { useAuthSessionBootstrap } from "@/features/auth/hooks/useAuthSession";

function SessionBootstrap() {
  useAuthSessionBootstrap();
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppQueryProvider>
      <SessionBootstrap />
      {children}
      <Toaster richColors position="top-right" />
    </AppQueryProvider>
  );
}
