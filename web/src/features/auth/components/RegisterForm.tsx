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
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, "Password must include upper, lower, number, symbol")
});

type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuthActions();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await register.mutateAsync({ ...values, email: values.email.trim().toLowerCase() });
      router.push("/login");
    } catch (error) {
      const normalized = normalizeApiError(error);
      form.setError("root", { message: normalized.message });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Full name" htmlFor="name" error={form.formState.errors.name?.message}>
        <Input id="name" autoComplete="name" {...form.register("name")} />
      </FormField>
      <FormField label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
        <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      {form.formState.errors.root?.message ? <ErrorMessage message={form.formState.errors.root.message} /> : null}
      <Button className="w-full" loading={register.isPending}>Create account</Button>
    </form>
  );
}
