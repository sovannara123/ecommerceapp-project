"use client";

import { Button } from "@/shared/ui/forms/Button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center">
      <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">{error.message}</p>
      <div className="mt-4">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
