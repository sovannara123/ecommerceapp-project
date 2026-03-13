import { ReactNode } from "react";

export function FormField({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="flex w-full flex-col gap-2 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
