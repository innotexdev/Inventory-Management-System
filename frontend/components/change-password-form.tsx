"use client";

import { useState } from "react";
import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordAction } from "@/lib/actions/users";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validation";
import { FormField } from "./form-field";
import { applyServerErrors } from "@/lib/apply-server-errors";

const PASSWORD_FIELDS = [
  "currentPassword",
  "newPassword",
  "confirmPassword",
] as const satisfies readonly Path<ChangePasswordValues>[];

export function ChangePasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ChangePasswordValues) {
    clearErrors();
    setSuccessMessage(null);
    const result = await changePasswordAction(values);
    applyServerErrors(setError, PASSWORD_FIELDS, result);
    if (result.success) {
      reset();
      setSuccessMessage(result.success);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        id="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <FormField
        id="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="8 to 64 characters, with an uppercase letter, a lowercase letter and a digit."
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <FormField
        id="confirmPassword"
        label="Confirm new password"
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
      {successMessage ? (
        <p role="status" className="text-sm text-green-700 dark:text-green-400">
          {successMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 self-start rounded-full bg-zinc-950 px-6 font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Updating password…" : "Change password"}
      </button>
    </form>
  );
}
