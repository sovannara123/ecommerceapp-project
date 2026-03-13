import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { LoadingSkeleton } from "@/shared/ui/feedback/LoadingSkeleton";

export default function GlobalLoading() {
  return (
    <PageContainer>
      <LoadingSkeleton className="h-48" />
    </PageContainer>
  );
}
