import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { SectionHeader } from "@/shared/ui/layout/SectionHeader";

export default function ProductsPage() {
  return (
    <PageContainer>
      <SectionHeader title="All products" subtitle="Live backend catalog with cursor pagination." />
      <ProductGrid />
    </PageContainer>
  );
}
