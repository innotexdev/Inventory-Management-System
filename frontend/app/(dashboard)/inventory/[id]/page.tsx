import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { StatusBadge } from "@/components/status-badge";
import { hasMinRole, requireRole } from "@/lib/auth";
import { EMPTY_VALUE, formatDate, fullName } from "@/lib/format";
import { getItem, getItemAssignments } from "@/lib/inventory";
import { ItemHistoryTable } from "./history-table";
import { StatusActions } from "./status-actions";

export const instant = false;

export const metadata: Metadata = {
  title: "Item detail",
  description: "Item fields, current holder and assignment history",
};

const sectionClassName =
  "rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950";

const backLinkClassName =
  "rounded-sm text-sm font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50";

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("MANAGER", "/inventory");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const item = await getItem(id);
  if (!item) {
    notFound();
  }

  const assignments = await getItemAssignments(id);

  const details: { label: string; value: string }[] = [
    { label: "Asset tag", value: item.assetTag },
    { label: "Category", value: item.category.name },
    { label: "Brand", value: item.brand ?? EMPTY_VALUE },
    { label: "Model", value: item.model ?? EMPTY_VALUE },
    { label: "Serial number", value: item.serialNumber ?? EMPTY_VALUE },
    { label: "Purchase date", value: formatDate(item.purchaseDate) },
    {
      label: "Current holder",
      value: item.currentHolder ? fullName(item.currentHolder) : EMPTY_VALUE,
    },
    { label: "Holder's team", value: item.currentHolder?.team?.name ?? EMPTY_VALUE },
    { label: "Added", value: formatDate(item.createdAt) },
    { label: "Last updated", value: formatDate(item.updatedAt) },
  ];

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Link href="/inventory" className={`self-start ${backLinkClassName}`}>
        Back to inventory
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {item.name}
        </h1>
        <StatusBadge status={item.status} />
      </div>

      <section aria-labelledby="item-properties-heading" className={sectionClassName}>
        <h2
          id="item-properties-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Item details
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">{detail.label}</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">{detail.value}</dd>
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-sm text-zinc-600 dark:text-zinc-400">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap font-medium text-zinc-950 dark:text-zinc-50">
              {item.notes ?? EMPTY_VALUE}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="item-actions-heading" className={sectionClassName}>
        <h2
          id="item-actions-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Actions
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/inventory/${item.id}/edit`}
            className="inline-flex h-10 items-center rounded-full border border-zinc-300 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
          >
            Edit item
          </Link>
          <StatusActions
            itemId={item.id}
            status={item.status}
            canRetire={hasMinRole(user.role, "ADMIN")}
          />
        </div>
      </section>

      <section aria-labelledby="item-history-heading" className={sectionClassName}>
        <h2
          id="item-history-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Assignment history
        </h2>
        <ItemHistoryTable rows={assignments} />
      </section>
    </main>
  );
}
