import Link from "next/link";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { Button } from "@/shared/ui/forms/Button";

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        title="Page not found"
        description="The page you are looking for does not exist."
        action={<Link href="/"><Button>Back home</Button></Link>}
      />
    </PageContainer>
  );
}
