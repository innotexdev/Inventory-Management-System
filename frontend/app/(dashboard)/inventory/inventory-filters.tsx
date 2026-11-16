"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { CategoryView } from "@/lib/api";
import {
  buildInventoryHref,
  hasActiveConstraints,
  STATUSES,
  STATUS_LABELS,
  type InventoryQuery,
  type QueryChange,
} from "@/lib/inventory-query";

const controlClassName =
  "w-full rounded-md border border-zinc-500 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50";

const labelClassName = "text-sm font-medium text-zinc-950 dark:text-zinc-50";

const linkClassName =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50";

export function InventoryFilters({
  query,
  categories,
}: {
  query: InventoryQuery;
  categories: CategoryView[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const currentParams = new URLSearchParams(params.toString());

  function apply(changes: QueryChange) {
    router.push(buildInventoryHref(currentParams, changes), { scroll: false });
  }

  const unassignedActive = query.status === "AVAILABLE";
  const unassignedHref = buildInventoryHref(
    currentParams,
    unassignedActive
      ? { status: undefined }
      : { status: "AVAILABLE", holderId: undefined, teamId: undefined },
  );

  return (
    <section
      aria-labelledby="inventory-filters-heading"
      className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2
        id="inventory-filters-heading"
        className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
      >
        Filter inventory
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const search = String(form.get("search") ?? "").trim();
          apply({ search: search || undefined });
        }}
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="inventory-search" className={labelClassName}>
            Search
          </label>
          <input
            key={query.search ?? ""}
            id="inventory-search"
            name="search"
            type="search"
            maxLength={100}
            defaultValue={query.search ?? ""}
            placeholder="Name, asset tag or serial"
            className={controlClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inventory-status" className={labelClassName}>
            Status
          </label>
          <select
            id="inventory-status"
            value={query.status ?? ""}
            onChange={(event) => apply({ status: event.target.value || undefined })}
            className={controlClassName}
          >
            <option value="">All except retired</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="inventory-category" className={labelClassName}>
            Category
          </label>
          <select
            id="inventory-category"
            value={query.categoryId ?? ""}
            onChange={(event) => apply({ categoryId: event.target.value || undefined })}
            className={controlClassName}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
          >
            Search
          </button>
          <Link href={unassignedHref} className={linkClassName}>
            {unassignedActive ? "Show all" : "Unassigned"}
          </Link>
        </div>
      </form>

      {hasActiveConstraints(params) ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Filters are applied.</p>
          <Link
            href="/inventory"
            className="rounded-sm text-sm font-medium text-zinc-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50"
          >
            Clear filters
          </Link>
        </div>
      ) : null}
    </section>
  );
}
