import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { PageContainer } from "@/shared/ui/layout/PageContainer";

export default function LoginPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-600">Login to manage cart and checkout.</p>
        <div className="mt-5"><LoginForm /></div>
        <p className="mt-4 text-sm text-slate-600">No account? <Link className="font-medium text-brand-700" href="/register">Register</Link></p>
      </div>
    </PageContainer>
  );
}
