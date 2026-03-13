import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { OrderConfirmation } from "@/features/orders/components/OrderConfirmation";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { SectionHeader } from "@/shared/ui/layout/SectionHeader";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AuthGuard>
      <PageContainer>
        <SectionHeader title="Order confirmation" subtitle="Track payment/order state from backend source of truth." />
        <OrderConfirmation orderId={id} />
      </PageContainer>
    </AuthGuard>
  );
}
