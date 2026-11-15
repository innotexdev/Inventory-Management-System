import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { AuthActionState } from "@/lib/actions/auth";

export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
  result: AuthActionState,
): void {
  const matched = fields.filter((field) => result.fieldErrors?.[field] !== undefined);
  for (const field of matched) {
    setError(field, { message: result.fieldErrors?.[field] });
  }
  if (matched.length === 0 && result.formError) {
    setError("root.server", { message: result.formError });
  }
}
