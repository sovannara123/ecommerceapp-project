"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PaymentFailurePage() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Your payment could not be processed.";

  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "rgb(var(--color-error) / 0.1)" }}
        >
          <span className="text-4xl">X</span>
        </div>
        <h1 className="mb-3 text-2xl font-bold">Payment Failed</h1>
        <p className="mb-8 text-[rgb(var(--color-text-secondary))]">{error}</p>
        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-6 font-medium text-white transition-colors hover:bg-[rgb(var(--color-accent-hover))]"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-[rgb(var(--color-border))] px-6 font-medium transition-colors hover:bg-[rgb(var(--color-bg-secondary))]"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
