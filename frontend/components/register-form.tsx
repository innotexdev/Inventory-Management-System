"use client";

import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/lib/actions/auth";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { FormField } from "./form-field";
import { applyServerErrors } from "@/lib/apply-server-errors";

const REGISTER_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "password",
  "confirmPassword",
] as const satisfies readonly Path<RegisterValues>[];

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), mode: "onTouched" });

  async function onSubmit(values: RegisterValues) {
    applyServerErrors(setError, REGISTER_FIELDS, await registerAction(values));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        id="firstName"
        label="First name"
        autoComplete="given-name"
        error={errors.firstName?.message}
        {...register("firstName")}
      />
      <FormField
        id="lastName"
        label="Last name"
        autoComplete="family-name"
        error={errors.lastName?.message}
        {...register("lastName")}
      />
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <FormField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
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
        {isSubmitting ? "Creating account…" : "Register"}
      </button>
    </form>
  );
}
