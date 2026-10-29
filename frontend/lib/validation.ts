import { z } from "zod";

const nameField = (field: string) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(2, `${field} must be at least 2 characters`)
    .max(50, `${field} must be at most 50 characters`)
    .regex(/^[A-Za-z\u0100-\u017F'’\- ]+$/, `${field} may only contain letters, spaces, hyphens and apostrophes`);

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

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
