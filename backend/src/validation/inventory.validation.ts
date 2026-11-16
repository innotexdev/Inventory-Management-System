import { z } from "zod";

const optionalText = (max: number, field: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z
      .string({ error: `${field} must be text` })
      .trim()
      .max(max, `${field} must be at most ${max} characters`)
      .nullish(),
  );

const purchaseDateSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.iso
    .date("Purchase date must be a valid date")
    .refine((value) => new Date(`${value}T00:00:00.000Z`) <= new Date(), {
      message: "Purchase date cannot be in the future",
    })
    .nullish()
    .transform((value) =>
      value === null || value === undefined ? value : new Date(`${value}T00:00:00.000Z`),
    ),
);

const serialNumberSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string({ error: "Serial number must be text" })
    .trim()
    .min(3, "Serial number must be at least 3 characters")
    .max(64, "Serial number must be at most 64 characters")
    .regex(/^[A-Za-z0-9-]+$/, "Serial number may only contain letters, digits and hyphens")
    .nullish(),
);

const nameSchema = z
  .string({ error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

const categoryIdSchema = z.uuid("Category is required");

export const createItemSchema = z.object({
  name: nameSchema,
  categoryId: categoryIdSchema,
  brand: optionalText(50, "Brand"),
  model: optionalText(50, "Model"),
  serialNumber: serialNumberSchema,
  purchaseDate: purchaseDateSchema,
  notes: optionalText(500, "Notes"),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z
  .object({
    name: nameSchema.optional(),
    categoryId: categoryIdSchema.optional(),
    brand: optionalText(50, "Brand"),
    model: optionalText(50, "Model"),
    serialNumber: serialNumberSchema,
    purchaseDate: purchaseDateSchema,
    notes: optionalText(500, "Notes"),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    error: "No fields to update",
  });

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const changeItemStatusSchema = z.object({
  status: z.enum(["AVAILABLE", "IN_REPAIR", "RETIRED"], { error: "Status is required" }),
});

export type ChangeItemStatusInput = z.infer<typeof changeItemStatusSchema>;

export const itemQuerySchema = z.object({
  search: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(100).optional(),
  ),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED"]).optional().catch(undefined),
  categoryId: z.uuid().optional().catch(undefined),
  teamId: z.uuid().optional().catch(undefined),
  holderId: z.uuid().optional().catch(undefined),
  sort: z.enum(["name", "assetTag", "createdAt"]).optional().catch(undefined),
  order: z.enum(["asc", "desc"]).optional().catch(undefined),
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().max(100).catch(20),
});

export type ItemQuery = z.infer<typeof itemQuerySchema>;
