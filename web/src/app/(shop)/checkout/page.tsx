import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { SectionHeader } from "@/shared/ui/layout/SectionHeader";

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <PageContainer>
        <SectionHeader title="Checkout" subtitle="Order and payment creation through backend APIs only." />
        <CheckoutForm />
      </PageContainer>
    </AuthGuard>
  );
}
