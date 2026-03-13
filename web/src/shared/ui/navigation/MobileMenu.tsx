"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/ui/forms/Button";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Menu"}</Button>
      {open ? (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-card">
          <nav className="flex flex-col gap-2 text-sm text-slate-700">
            <Link href="/">Home</Link>
            <Link href="/products">Products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
