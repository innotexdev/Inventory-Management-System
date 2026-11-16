import { z } from "zod";

const nameField = (field: string) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(2, `${field} must be at least 2 characters`)
    .max(50, `${field} must be at most 50 characters`)
    .regex(
      /^[A-Za-z\u0100-\u017F'’\- ]+$/,
      `${field} may only contain letters, spaces, hyphens and apostrophes`,
    );

const emailField = z
  .string({ error: "Email is required" })
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email must be at most 254 characters")
  .regex(/^\S+@\S+\.\S+$/, "Enter a valid email address");

const newPasswordField = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(64, "Password must be at most 64 characters")
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain a lowercase letter, an uppercase letter and a digit",
  );

export const registerSchema = z
  .object({
    firstName: nameField("First name"),
    lastName: nameField("Last name"),
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
});

const currentPasswordField = z
  .string({ error: "Current password is required" })
  .min(1, "Current password is required");

export const changePasswordSchema = z
  .object({
    currentPassword: currentPasswordField,
    newPassword: newPasswordField,
    confirmPassword: z.string({ error: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password",
  });

const itemOptionalText = (max: number, field: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z
      .string({ error: `${field} must be text` })
      .trim()
      .max(max, `${field} must be at most ${max} characters`)
      .nullish(),
  );

const itemSerialNumber = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string({ error: "Serial number must be text" })
    .trim()
    .min(3, "Serial number must be at least 3 characters")
    .max(64, "Serial number must be at most 64 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Serial number may only contain letters, digits and hyphens")
    .nullish(),
);

const itemPurchaseDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.iso
    .date("Purchase date must be a valid date")
    .refine((value) => new Date(`${value}T00:00:00.000Z`) <= new Date(), {
      message: "Purchase date cannot be in the future",
    })
    .nullish(),
);

export const itemSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  categoryId: z.uuid("Category is required"),
  brand: itemOptionalText(50, "Brand"),
  model: itemOptionalText(50, "Model"),
  serialNumber: itemSerialNumber,
  purchaseDate: itemPurchaseDate,
  notes: itemOptionalText(500, "Notes"),
});

export const itemStatusSchema = z.enum(["AVAILABLE", "IN_REPAIR", "RETIRED"]);

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ItemInput = z.input<typeof itemSchema>;
export type ItemValues = z.infer<typeof itemSchema>;
export type ItemStatusValue = z.infer<typeof itemStatusSchema>;
