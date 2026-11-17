import { z } from "zod";
import { nameSchema } from "./auth.validation";

export const updateUserSchema = z
  .object({
    firstName: nameSchema("firstName").optional(),
    lastName: nameSchema("lastName").optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: "No fields to update",
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string({ message: "Current Password is required" }),
    newPassword: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be at most 64 characters")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain a lowercase letter, an uppercase letter and a digit",
      ),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof changePasswordSchema>;

export const userQuerySchema = z.object({
  search: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(100).optional(),
  ),
  teamId: z.uuid().optional().catch(undefined),
  role: z.enum(["EMPLOYEE", "MANAGER", "ADMIN"]).optional().catch(undefined),
  isActive: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional().catch(undefined),
  ),
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().max(100).catch(20),
});

export type UserQuery = z.infer<typeof userQuerySchema>;
