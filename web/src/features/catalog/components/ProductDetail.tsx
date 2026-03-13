"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useProduct } from "@/features/catalog/hooks/useProducts";
import { useCartMutations } from "@/features/cart/hooks/useCart";
import { normalizeApiError } from "@/shared/api/error";
import { PriceDisplay } from "@/shared/ui/commerce/PriceDisplay";
import { QuantitySelector } from "@/shared/ui/commerce/QuantitySelector";
import { Button } from "@/shared/ui/forms/Button";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

export function ProductDetail({ productId }: { productId: string }) {
  const [qty, setQty] = useState(1);
  const query = useProduct(productId);
  const cart = useCartMutations();

  if (query.isLoading) {
    return <LoadingSkeleton className="h-96" />;
  }

  if (query.isError || !query.data) {
    return <EmptyState title="Product unavailable" description="This product could not be loaded." />;
  }

  const product = query.data;
  const imageUrl = product.images[0];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const onAdd = async () => {
    try {
      await cart.add.mutateAsync({ productId: product._id, qty });
      toast.success("Added to cart");
    } catch (error) {
      toast.error(normalizeApiError(error).message);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            width={800}
            height={800}
            className="h-full w-full object-cover"
            style={{ objectFit: "cover" }}
            unoptimized={imageUrl.startsWith("http") && (apiUrl ? !imageUrl.includes(apiUrl) : true)}
          />
        ) : null}
      </div>
      <div className="space-y-4">
        <h1 className="text-safe line-clamp-2 text-3xl font-bold text-slate-900">
          {product.title}
        </h1>
        <p className="text-safe line-clamp-3 text-slate-600">
          {product.description}
        </p>
        <p className="text-2xl font-semibold text-slate-900"><PriceDisplay amount={product.price} currency={product.currency} /></p>
        <div className="flex items-center gap-3">
          <QuantitySelector qty={qty} onChange={setQty} max={Math.max(1, product.stock)} />
          <Button onClick={onAdd} disabled={product.stock < 1}>Add to cart</Button>
        </div>
      </div>
    </div>
  );
}
