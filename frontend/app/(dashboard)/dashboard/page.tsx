import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getInventoryStats } from "@/lib/inventory";
import { STATUSES, STATUS_LABELS } from "@/lib/inventory-query";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Inventory totals and assignment overview",
};

const linkClassName =
  "rounded-sm font-semibold text-zinc-950 underline decoration-zinc-400 underline-offset-4 transition-colors hover:decoration-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-50 dark:decoration-zinc-500 dark:hover:decoration-zinc-50 dark:focus-visible:outline-zinc-50";

const cardClassName =
  "rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950";

export default async function DashboardPage() {
  await requireRole("MANAGER", "/dashboard");

  const stats = await getInventoryStats();

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Dashboard
      </h1>

      <section
        aria-labelledby="totals-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="totals-heading" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Inventory totals
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={cardClassName}>
            <dt className="text-sm text-zinc-600 dark:text-zinc-400">Total items</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              <Link
                href="/inventory"
                className={linkClassName}
                aria-label={`Show all ${stats.total} items`}
              >
                {stats.total}
              </Link>
            </dd>
          </div>
          {STATUSES.map((status) => (
            <div key={status} className={cardClassName}>
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">{STATUS_LABELS[status]}</dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                <Link
                  href={`/inventory?status=${status}`}
                  className={linkClassName}
                  aria-label={`Show ${stats.byStatus[status]} ${STATUS_LABELS[status].toLowerCase()} items`}
                >
                  {stats.byStatus[status]}
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="categories-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          id="categories-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          By category
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table
            aria-label="Inventory counts by category"
            className="w-full min-w-[32rem] text-left text-sm"
          >
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Assigned
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                >
                  Available
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.byCategory.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-medium text-zinc-950 dark:text-zinc-50"
                  >
                    {category.name}
                  </th>
                  <td className="px-4 py-3 text-zinc-950 dark:text-zinc-50">
                    <Link
                      href={`/inventory?categoryId=${category.id}`}
                      className={linkClassName}
                      aria-label={`Show ${category.total} ${category.name} items`}
                    >
                      {category.total}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-950 dark:text-zinc-50">
                    <Link
                      href={`/inventory?categoryId=${category.id}&status=ASSIGNED`}
                      className={linkClassName}
                      aria-label={`Show ${category.assigned} assigned ${category.name} items`}
                    >
                      {category.assigned}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-950 dark:text-zinc-50">
                    <Link
                      href={`/inventory?categoryId=${category.id}&status=AVAILABLE`}
                      className={linkClassName}
                      aria-label={`Show ${category.available} available ${category.name} items`}
                    >
                      {category.available}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
