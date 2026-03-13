import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { PageContainer } from "@/shared/ui/layout/PageContainer";

export default function RegisterPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">Secure registration with backend password hardening.</p>
        <div className="mt-5"><RegisterForm /></div>
        <p className="mt-4 text-sm text-slate-600">Already have one? <Link className="font-medium text-brand-700" href="/login">Login</Link></p>
      </div>
    </PageContainer>
  );
}
