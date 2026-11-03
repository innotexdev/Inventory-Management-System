"use client";

import { useState } from "react";
import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileAction } from "@/lib/actions/users";
import { updateProfileSchema, type UpdateProfileValues } from "@/lib/validation";
import { FormField } from "./form-field";
import { applyServerErrors } from "@/lib/apply-server-errors";

const PROFILE_FIELDS = [
  "firstName",
  "lastName",
] as const satisfies readonly Path<UpdateProfileValues>[];

export function ProfileDetailsForm({ firstName, lastName }: UpdateProfileValues) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onTouched",
    defaultValues: { firstName, lastName },
  });

  async function onSubmit(values: UpdateProfileValues) {
    clearErrors();
    setSuccessMessage(null);
    const result = await updateProfileAction(values);
    applyServerErrors(setError, PROFILE_FIELDS, result);
    if (result.success) {
      setSuccessMessage(result.success);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <FormField
        id="firstName"
        label="First name"
        hint="2 to 50 characters. Letters, spaces, hyphens and apostrophes only."
        autoComplete="given-name"
        error={errors.firstName?.message}
        {...register("firstName")}
      />
      <FormField
        id="lastName"
        label="Last name"
        autoComplete="family-name"
        hint="2 to 50 characters. Letters, spaces, hyphens and apostrophes only."
        error={errors.lastName?.message}
        {...register("lastName")}
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
        {isSubmitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
