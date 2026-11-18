import { z } from "zod";

const teamNameSchema = z
  .string({ error: "Team name is required" })
  .trim()
  .min(2, "Team name must be at least 2 characters")
  .max(50, "Team name must be at most 50 characters");

export const createTeamSchema = z.object({
  name: teamNameSchema,
  description: z
    .string()
    .trim()
    .max(250, "Description must be at most 250 characters")
    .nullable()
    .optional(),
});

export const updateTeamSchema = z
  .object({
    name: teamNameSchema.optional(),
    description: z
      .string()
      .trim()
      .max(250, "Description must be at most 250 characters")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: "No fields to update",
  });
