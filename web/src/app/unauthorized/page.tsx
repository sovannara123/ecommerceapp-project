import Link from "next/link";
import { EmptyState } from "@/shared/ui/feedback/EmptyState";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { Button } from "@/shared/ui/forms/Button";

export default function UnauthorizedPage() {
  return (
    <PageContainer>
      <EmptyState
        title="Unauthorized"
        description="You do not have permission to view this page."
        action={<Link href="/login"><Button>Go to login</Button></Link>}
      />
    </PageContainer>
  );
}
