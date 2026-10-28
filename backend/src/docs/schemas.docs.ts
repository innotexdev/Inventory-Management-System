import { z } from "zod";
import { loginSchema, registerSchema } from "../validation/auth.validation";
function stripPatterns(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripPatterns);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key === "pattern") continue;
      out[key] = stripPatterns(v);
    }
    return out;
  }
  return value;
}

function toSchema(schema: z.ZodType, extra?: Record<string, unknown>): Record<string, unknown> {
  const { $schema: _dropped, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  void _dropped;
  const cleaned = stripPatterns(rest) as Record<string, unknown>;
  return extra ? { ...cleaned, ...extra } : cleaned;
}

export const generatedSchemas: Record<string, unknown> = {
  Login: toSchema(loginSchema),
  Register: toSchema(registerSchema),
};
