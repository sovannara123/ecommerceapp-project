import type { CartItem as CartItemType } from "@/entities/cart/types";
import { Button } from "@/shared/ui/forms/Button";
import { QuantitySelector } from "@/shared/ui/commerce/QuantitySelector";

export function CartItem({ item, onUpdate, onRemove }: { item: CartItemType; onUpdate: (qty: number) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Product: {item.productId}</p>
        <p className="text-xs text-slate-500">Snapshot price: {item.priceSnapshot}</p>
      </div>
      <div className="flex items-center gap-3">
        <QuantitySelector qty={item.qty} onChange={onUpdate} />
        <Button variant="danger" onClick={onRemove}>Remove</Button>
      </div>
    </div>
  );
}
