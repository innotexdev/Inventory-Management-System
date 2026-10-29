import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "My inventory",
  description: "Equipment assigned to you",
};

export default async function MyInventoryPage() {
  const user = await requireUser("/my-inventory");

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        My inventory
      </h1>
      <section
        aria-label="Assigned equipment"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <p className="text-zinc-600 dark:text-zinc-400">
          {user.firstName}, nothing is assigned to you yet. Items assigned to you will appear here.
        </p>
      </section>
    </main>
  );
}
