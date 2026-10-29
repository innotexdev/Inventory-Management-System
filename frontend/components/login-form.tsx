"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/lib/actions/auth";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { FormField } from "./form-field";

type FieldName = "email" | "password";

export function LoginForm({ next }: { next: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  async function onSubmit(values: LoginValues) {
    const result = await loginAction(values, next);
    if (!result) {
      return;
    }

    const names: FieldName[] = ["email", "password"];
    let mapped = false;
    for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
      if (names.includes(field as FieldName)) {
        setError(field as FieldName, { message });
        mapped = true;
      }
    }
    if (!mapped && result.formError) {
      setError("root.server", { message: result.formError });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      {errors.root?.server ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errors.root.server.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 rounded-full bg-zinc-950 font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
