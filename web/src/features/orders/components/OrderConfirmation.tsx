"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { orderApi } from "@/shared/api/orderApi";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";
import { PriceDisplay } from "@/shared/ui/commerce/PriceDisplay";

export function OrderConfirmation({ orderId }: { orderId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const [clientSecret, setClientSecret] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (provider !== "stripe") {
      setClientSecret(null);
      return;
    }

    const stored = typeof window !== "undefined"
      ? sessionStorage.getItem(`stripe_cs_${orderId}`)
      : null;

    if (stored) {
      setClientSecret(stored);
      sessionStorage.removeItem(`stripe_cs_${orderId}`);
      return;
    }

    setClientSecret(null);
  }, [orderId, provider]);

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getMine(orderId)
  });

  if (provider === "stripe" && clientSecret === undefined) return <LoadingSkeleton className="h-48" />;
  if (provider === "stripe" && !clientSecret) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-red-600">Payment Session Expired</h2>
        <p className="mt-2 text-gray-600">
          Your payment session has expired or is invalid. Please retry checkout.
        </p>
        <button
          onClick={() => router.push("/cart")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded"
        >
          Return to Cart
        </button>
      </div>
    );
  }
  if (query.isLoading) return <LoadingSkeleton className="h-48" />;
  if (query.isError || !query.data) return <EmptyState title="Order not found" description="We could not load your order." />;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900">Order {query.data._id}</h2>
      <p className="text-sm text-slate-600">Status: {query.data.status}</p>
      <p className="text-sm text-slate-600">Items: {query.data.items.length}</p>
      <p className="text-lg font-semibold text-slate-900"><PriceDisplay amount={query.data.total} currency={query.data.currency} /></p>
    </div>
  );
}
