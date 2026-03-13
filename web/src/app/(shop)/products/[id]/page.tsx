import type { Metadata } from "next";
import { ProductDetail } from "@/features/catalog/components/ProductDetail";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import type { ApiEnvelope } from "@/shared/types/api";
import type { Product } from "@/entities/product/types";

async function fetchProductForMetadata(id: string): Promise<Product | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const res = await fetch(`${base}/catalog/products/${id}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const body = (await res.json()) as ApiEnvelope<Product>;
  if (!body.success) return null;
  return body.data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProductForMetadata(id);
  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [product.images[0]] : []
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PageContainer>
      <ProductDetail productId={id} />
    </PageContainer>
  );
}
