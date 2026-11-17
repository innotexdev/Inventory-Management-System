import { z } from "zod";

const noteSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string({ error: "Note must be text" })
    .trim()
    .max(250, "Note must be at most 250 characters")
    .nullish(),
);

export const assignSchema = z.object({
  userId: z.uuid("User is required"),
  note: noteSchema,
});

export type AssignInput = z.infer<typeof assignSchema>;

export const unassignSchema = z.object({ note: noteSchema }).default({});

export type UnassignInput = z.infer<typeof unassignSchema>;
