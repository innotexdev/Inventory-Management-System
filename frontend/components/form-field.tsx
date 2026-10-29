"use client";

import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

const inputClassName = (invalid: boolean) =>
  `w-full rounded-md border bg-white px-3 py-2 text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 ${
    invalid ? "border-red-600 dark:border-red-500" : "border-zinc-300 dark:border-zinc-700"
  }`;

export function FormField({ id, label, error, ...props }: FormFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={inputClassName(error !== undefined)}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
