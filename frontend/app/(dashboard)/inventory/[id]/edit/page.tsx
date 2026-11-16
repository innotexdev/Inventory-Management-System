import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getCategories, getItem } from "@/lib/inventory";
import { ItemForm } from "../../item-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Edit item",
  description: "Edit inventory item fields",
};

const backLinkClassName =
  "self-start rounded-sm text-sm font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("MANAGER", "/inventory");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const [item, categories] = await Promise.all([getItem(id), getCategories()]);
  if (!item) {
    notFound();
  }

  return (
    <main className="flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <Link href={`/inventory/${item.id}`} className={backLinkClassName}>
        Back to item
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Edit item
      </h1>
      <section
        aria-labelledby="edit-item-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="edit-item-heading" className="sr-only">
          Item fields
        </h2>
        <ItemForm mode="edit" categories={categories} item={item} />
      </section>
    </main>
  );
}
