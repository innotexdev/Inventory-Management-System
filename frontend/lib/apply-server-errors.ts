import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export interface ServerActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
}

export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  result?: ServerActionState | null,
): void {
  if (!result) return;
  const matched = fields.filter((field) => result.fieldErrors?.[field] !== undefined);
  for (const field of matched) {
    setError(field, { message: result.fieldErrors?.[field] });
  }
  if (matched.length === 0 && result.formError) {
    setError("root.server", { message: result.formError });
  }
}
