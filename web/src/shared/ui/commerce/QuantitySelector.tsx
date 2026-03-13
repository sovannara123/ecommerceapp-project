"use client";

import { Button } from "@/shared/ui/forms/Button";

export function QuantitySelector({ qty, min = 1, max = 99, onChange }: { qty: number; min?: number; max?: number; onChange: (next: number) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 p-1">
      <Button type="button" variant="ghost" onClick={() => onChange(Math.max(min, qty - 1))}>-</Button>
      <span className="w-8 text-center text-sm">{qty}</span>
      <Button type="button" variant="ghost" onClick={() => onChange(Math.min(max, qty + 1))}>+</Button>
    </div>
  );
}
