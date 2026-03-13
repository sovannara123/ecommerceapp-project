import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/entities/product/types";
import { Button } from "@/shared/ui/forms/Button";
import { PriceDisplay } from "@/shared/ui/commerce/PriceDisplay";

export function ProductCard({ product, onAdd }: { product: Product; onAdd?: (id: string) => void }) {
  const imageUrl = product.images[0];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <Link href={`/products/${product._id}`}>
        <div className="aspect-[4/3] bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              width={300}
              height={300}
              className="h-full w-full object-cover"
              style={{ objectFit: "cover" }}
              unoptimized={imageUrl.startsWith("http") && (apiUrl ? !imageUrl.includes(apiUrl) : true)}
            />
          ) : null}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <Link
          href={`/products/${product._id}`}
          className="text-safe line-clamp-2 block text-sm font-semibold text-slate-900"
        >
          {product.title}
        </Link>
        <p className="text-safe line-clamp-2 text-xs text-slate-600">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900"><PriceDisplay amount={product.price} currency={product.currency} /></span>
          {onAdd ? <Button onClick={() => onAdd(product._id)}>Add</Button> : null}
        </div>
      </div>
    </article>
  );
}
