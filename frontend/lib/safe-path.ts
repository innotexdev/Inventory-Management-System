const INTERNAL_ORIGIN = "http://internal.invalid";

export function isSafeNextPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    new URL(value, INTERNAL_ORIGIN).origin === INTERNAL_ORIGIN
  );
}
