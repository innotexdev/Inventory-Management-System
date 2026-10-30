import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Inventory totals and assignment overview",
};

export default async function DashboardPage() {
  const user = await requireRole(["MANAGER", "ADMIN"], "/dashboard");

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Dashboard
      </h1>
      <section
        aria-label="Inventory totals"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          Welcome, {user.firstName}. Inventory totals will appear here.
        </p>
      </section>
    </main>
  );
}
