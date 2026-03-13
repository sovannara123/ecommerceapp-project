"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/forms/Button";
import { FormField } from "@/shared/ui/forms/FormField";
import { Input } from "@/shared/ui/forms/Input";
import { checkoutSchema, type CheckoutFormValues } from "@/features/checkout/components/checkout-types";
import { PAYMENT_PROVIDER, PAYWAY_PAYMENT_OPTION } from "@/entities/payment/constants";
import { useCheckoutSubmit } from "@/features/checkout/hooks/useCheckoutSubmit";

export function CheckoutForm() {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      line1: "",
      city: "",
      province: "",
      postalCode: "",
      shippingFee: 0,
      paymentProvider: PAYMENT_PROVIDER.payway,
      paymentOption: PAYWAY_PAYMENT_OPTION.abaDeeplink
    }
  });

  const { onSubmit, submitting } = useCheckoutSubmit({ form });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <FormField label="Full name" htmlFor="fullName" error={form.formState.errors.fullName?.message}>
        <Input id="fullName" {...form.register("fullName")} />
      </FormField>
      <FormField label="Phone" htmlFor="phone" error={form.formState.errors.phone?.message}>
        <Input id="phone" {...form.register("phone")} />
      </FormField>
      <FormField label="Address line" htmlFor="line1" error={form.formState.errors.line1?.message}>
        <Input id="line1" {...form.register("line1")} />
      </FormField>
      <FormField label="City" htmlFor="city" error={form.formState.errors.city?.message}>
        <Input id="city" {...form.register("city")} />
      </FormField>
      <FormField label="Province" htmlFor="province" error={form.formState.errors.province?.message}>
        <Input id="province" {...form.register("province")} />
      </FormField>
      <FormField label="Postal code" htmlFor="postalCode" error={form.formState.errors.postalCode?.message}>
        <Input id="postalCode" {...form.register("postalCode")} />
      </FormField>
      <FormField label="Shipping fee" htmlFor="shippingFee" error={form.formState.errors.shippingFee?.message}>
        <Input id="shippingFee" type="number" step="0.01" {...form.register("shippingFee")} />
      </FormField>
      <FormField label="Payment provider" htmlFor="paymentProvider" error={form.formState.errors.paymentProvider?.message}>
        <select id="paymentProvider" className="h-11 rounded-lg border border-slate-300 px-3" {...form.register("paymentProvider")}>
          <option value={PAYMENT_PROVIDER.payway}>PayWay</option>
          <option value={PAYMENT_PROVIDER.stripe}>Stripe</option>
        </select>
      </FormField>
      <FormField label="Payment option" htmlFor="paymentOption" error={form.formState.errors.paymentOption?.message}>
        <Input id="paymentOption" {...form.register("paymentOption")} />
      </FormField>
      {form.formState.errors.root?.message ? (
        <p className="col-span-full rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{form.formState.errors.root.message}</p>
      ) : null}
      <div className="col-span-full">
        <Button className="w-full md:w-auto" loading={submitting}>Place order</Button>
      </div>
    </form>
  );
}
