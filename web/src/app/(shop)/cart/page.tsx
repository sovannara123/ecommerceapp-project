import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { CartView } from "@/features/cart/components/CartView";
import { PageContainer } from "@/shared/ui/layout/PageContainer";
import { SectionHeader } from "@/shared/ui/layout/SectionHeader";

export default function CartPage() {
  return (
    <AuthGuard>
      <PageContainer>
        <SectionHeader title="Your cart" subtitle="Device-scoped cart synced with backend." />
        <CartView />
      </PageContainer>
    </AuthGuard>
  );
}
