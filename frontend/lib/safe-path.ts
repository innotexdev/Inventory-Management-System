const INTERNAL_ORIGIN = "http://internal.invalid";

export function isSafeNextPath(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(value) ||
    /%5c/i.test(value)
  ) {
    return false;
  }

  try {
    const url = new URL(value, INTERNAL_ORIGIN);

    return url.origin === INTERNAL_ORIGIN;
  } catch {
    return false;
  }
}
