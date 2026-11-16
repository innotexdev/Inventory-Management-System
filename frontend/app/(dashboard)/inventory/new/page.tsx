import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getCategories } from "@/lib/inventory";
import { ItemForm } from "../item-form";

export const instant = false;

export const metadata: Metadata = {
  title: "New item",
  description: "Add an item to the inventory",
};

const backLinkClassName =
  "self-start rounded-sm text-sm font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50";

export default async function NewItemPage() {
  await requireRole("MANAGER", "/inventory/new");
  const categories = await getCategories();

  return (
    <main className="flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Link href="/inventory" className={backLinkClassName}>
        Back to inventory
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New item
      </h1>
      <section
        aria-labelledby="new-item-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="new-item-heading" className="sr-only">
          Item details
        </h2>
        <ItemForm mode="create" categories={categories} />
      </section>
    </main>
  );
}
