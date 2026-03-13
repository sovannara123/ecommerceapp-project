import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

export default function ProductDetailLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-96" />
    </PageContainer>
  );
}
