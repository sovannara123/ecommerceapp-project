"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { authApi } from "@/shared/api/authApi";
import { normalizeApiError } from "@/shared/api/error";
import { Button } from "@/shared/ui/forms/Button";
import { MobileMenu } from "@/shared/ui/navigation/MobileMenu";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { toast } from "sonner";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const router = useRouter();

  const onLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toast.error(normalized.message);
    } finally {
      clear();
      queryClient.clear();
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <PageContainer>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">Northstar Commerce</Link>
          <nav className="hidden items-center gap-5 text-sm text-slate-700 md:flex">
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="text-sm text-slate-600">{user.name}</span>
                <Button variant="secondary" onClick={onLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Login</Button></Link>
                <Link href="/register"><Button>Create account</Button></Link>
              </>
            )}
          </div>
          <MobileMenu />
        </div>
      </PageContainer>
    </header>
  );
}
