import { z } from "zod";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import { changePasswordSchema, updateUserSchema } from "../validation/user.validation";

function toOpenApiSchema(schema: z.ZodType): Record<string, unknown> {
  const { $schema, ...rest } = z.toJSONSchema(schema);

  return rest;
}

export const generatedSchemas: Record<string, unknown> = {
  Login: toOpenApiSchema(loginSchema),
  Register: toOpenApiSchema(registerSchema),
  UpdatePassword: toOpenApiSchema(changePasswordSchema),
  UpdateUser: toOpenApiSchema(updateUserSchema),
};
