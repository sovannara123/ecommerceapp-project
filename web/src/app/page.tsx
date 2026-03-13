import Link from "next/link";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { SectionHeader } from "@/shared/ui/layout/SectionHeader";
import { Button } from "@/shared/ui/forms/Button";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";

export default function HomePage() {
  return (
    <PageContainer>
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-700 px-8 py-14 text-white">
        <p className="text-sm uppercase tracking-widest text-slate-200">Spring collection</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-bold">Premium essentials for modern shoppers</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200">Built for high conversion with reliable checkout and hardened auth/payments.</p>
        <div className="mt-6">
          <Link href="/products"><Button>Shop now</Button></Link>
        </div>
      </section>

      <SectionHeader title="Featured products" subtitle="Conversion-focused layout with backend-backed pagination." />
      <ProductGrid />
    </PageContainer>
  );
}
