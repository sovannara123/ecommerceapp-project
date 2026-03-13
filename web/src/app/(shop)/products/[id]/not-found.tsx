import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";

export default function ProductNotFound() {
  return (
    <PageContainer>
      <EmptyState title="Product not found" description="This product may have been removed." />
    </PageContainer>
  );
}
