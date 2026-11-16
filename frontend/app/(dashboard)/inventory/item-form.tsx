"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Path } from "react-hook-form";
import { createItemAction, updateItemAction } from "@/lib/actions/items";
import { applyServerErrors } from "@/lib/apply-server-errors";
import type { CategoryView, InventoryItem } from "@/lib/api";
import { itemSchema, type ItemInput } from "@/lib/validation";
import { FormField } from "@/components/form-field";

const ITEM_FIELDS = [
  "name",
  "categoryId",
  "brand",
  "model",
  "serialNumber",
  "purchaseDate",
  "notes",
] as const satisfies readonly Path<ItemInput>[];

const labelClassName = "text-sm font-medium text-zinc-950 dark:text-zinc-50";

const controlClassName = (invalid: boolean) =>
  `w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50 ${
    invalid ? "border-red-600 dark:border-red-500" : "border-zinc-500"
  }`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

type ItemFormProps =
  | { mode: "create"; categories: CategoryView[]; item?: never }
  | { mode: "edit"; categories: CategoryView[]; item: InventoryItem };

export function ItemForm(props: ItemFormProps) {
  const { categories } = props;
  const item = props.mode === "edit" ? props.item : undefined;
  const [success, setSuccess] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    mode: "onTouched",
    defaultValues: {
      name: item?.name ?? "",
      categoryId: item?.category.id ?? "",
      brand: item?.brand ?? "",
      model: item?.model ?? "",
      serialNumber: item?.serialNumber ?? "",
      purchaseDate: item?.purchaseDate?.slice(0, 10) ?? "",
      notes: item?.notes ?? "",
    },
  });

  async function onSubmit(values: ItemInput) {
    clearErrors();
    setSuccess(null);
    setCreatedId(null);

    const result =
      props.mode === "create"
        ? await createItemAction(values)
        : await updateItemAction(props.item.id, values);

    applyServerErrors(setError, ITEM_FIELDS, result);
    if (result.success) {
      setSuccess(result.success);
      setCreatedId(result.itemId ?? null);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="name"
          label="Name"
          hint="2 to 100 characters."
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className={labelClassName}>
            Category
          </label>
          <select
            id="categoryId"
            aria-invalid={errors.categoryId ? true : undefined}
            aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
            className={controlClassName(errors.categoryId !== undefined)}
            {...register("categoryId")}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError id="categoryId-error" message={errors.categoryId?.message} />
        </div>

        <FormField
          id="brand"
          label="Brand"
          required={false}
          hint="Optional, at most 50 characters."
          error={errors.brand?.message}
          {...register("brand")}
        />

        <FormField
          id="model"
          label="Model"
          required={false}
          hint="Optional, at most 50 characters."
          error={errors.model?.message}
          {...register("model")}
        />

        <FormField
          id="serialNumber"
          label="Serial number"
          required={false}
          hint="Optional, 3 to 64 letters, digits or hyphens. Must be unique."
          error={errors.serialNumber?.message}
          {...register("serialNumber")}
        />

        <FormField
          id="purchaseDate"
          label="Purchase date"
          type="date"
          required={false}
          hint="Optional, cannot be in the future."
          error={errors.purchaseDate?.message}
          {...register("purchaseDate")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={errors.notes ? "notes-error" : undefined}
          className={controlClassName(errors.notes !== undefined)}
          {...register("notes")}
        />
        <FieldError id="notes-error" message={errors.notes?.message} />
      </div>

      {errors.root?.server ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errors.root.server.message}
        </p>
      ) : null}

      {success ? (
        <div
          role="status"
          className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
        >
          <p>{success}</p>
          {createdId ? (
            <Link
              href={`/inventory/${createdId}`}
              className="mt-1 inline-block rounded-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50"
            >
              View the new item
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-full bg-zinc-950 px-6 font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
        >
          {isSubmitting ? "Saving…" : props.mode === "create" ? "Create item" : "Save changes"}
        </button>
        <Link
          href={item ? `/inventory/${item.id}` : "/inventory"}
          className="rounded-sm text-sm font-medium text-zinc-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          {props.mode === "create" ? "Back to inventory" : "Cancel"}
        </Link>
      </div>
    </form>
  );
}
