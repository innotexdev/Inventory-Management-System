import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCategories, getItems } from "@/lib/inventory";
import { parseInventoryQuery, type RawSearchParams } from "@/lib/inventory-query";
import { InventoryFilters } from "./inventory-filters";
import { InventoryTable } from "./inventory-table";

export const instant = false;

export const metadata: Metadata = {
  title: "Inventory",
  description: "Search, filter and browse all inventory items",
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireRole("MANAGER", "/inventory");

  const query = parseInventoryQuery(await searchParams);
  const [result, categories] = await Promise.all([getItems(query), getCategories()]);

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Inventory
        </h1>
        <Link
          href="/inventory/new"
          className="inline-flex h-10 items-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
        >
          New item
        </Link>
      </div>

      <InventoryFilters query={query} categories={categories} />

      <section
        aria-labelledby="inventory-results-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="inventory-results-heading" className="sr-only">
          Inventory results
        </h2>
        <InventoryTable query={query} result={result} />
      </section>
    </main>
  );
}
