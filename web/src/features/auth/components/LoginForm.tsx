"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@/features/auth/hooks/useAuthActions";
import { normalizeApiError } from "@/shared/api/error";
import { Button } from "@/shared/ui/forms/Button";
import { FormField } from "@/shared/ui/forms/FormField";
import { Input } from "@/shared/ui/forms/Input";
import { PasswordInput } from "@/shared/ui/forms/PasswordInput";
import { ErrorMessage } from "@/shared/ui/feedback/ErrorMessage";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthActions();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = { ...values, email: values.email.trim().toLowerCase() };
    try {
      await login.mutateAsync(payload);
      router.push("/");
      router.refresh();
    } catch (error) {
      const normalized = normalizeApiError(error);
      form.setError("root", { message: normalized.message });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
        <PasswordInput id="password" autoComplete="current-password" {...form.register("password")} />
      </FormField>
      {form.formState.errors.root?.message ? <ErrorMessage message={form.formState.errors.root.message} /> : null}
      <Button className="w-full" loading={login.isPending}>Login</Button>
    </form>
  );
}
