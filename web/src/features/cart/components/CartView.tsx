"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useCart, useCartMutations } from "@/features/cart/hooks/useCart";
import { normalizeApiError } from "@/shared/api/error";
import { CartItem } from "@/shared/ui/commerce/CartItem";
import { Button } from "@/shared/ui/forms/Button";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

export function CartView() {
  const cart = useCart();
  const mutations = useCartMutations();

  if (cart.isLoading) {
    return <LoadingSkeleton className="h-52" />;
  }

  const items = cart.data?.items || [];

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add products before checkout."
        action={<Link href="/products"><Button>Browse products</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem
          key={item.productId}
          item={item}
          onUpdate={async (qty) => {
            try {
              await mutations.update.mutateAsync({ productId: item.productId, qty });
            } catch (error) {
              toast.error(normalizeApiError(error).message);
            }
          }}
          onRemove={async () => {
            try {
              await mutations.remove.mutateAsync({ productId: item.productId });
            } catch (error) {
              toast.error(normalizeApiError(error).message);
            }
          }}
        />
      ))}
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            try {
              await mutations.clear.mutateAsync();
            } catch (error) {
              toast.error(normalizeApiError(error).message);
            }
          }}
        >
          Clear cart
        </Button>
        <Link href="/checkout"><Button>Proceed to checkout</Button></Link>
      </div>
    </div>
  );
}
