import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getMyAssignments, getMyItems } from "@/lib/users";
import { AssignedItemsTable, AssignmentHistoryTable } from "./inventory-tables";

export const instant = false;

export const metadata: Metadata = {
  title: "My inventory",
  description: "Equipment assigned to you",
};

export default async function MyInventoryPage() {
  await requireRole("EMPLOYEE", "/my-inventory");

  const [items, assignments] = await Promise.all([getMyItems(), getMyAssignments()]);

  const activeAssignedAt = new Map<string, string>();
  for (const assignment of assignments) {
    if (assignment.returnedAt === null) {
      activeAssignedAt.set(assignment.item.id, assignment.assignedAt);
    }
  }

  const assignedRows = items.map((item) => ({
    ...item,
    assignedAt: activeAssignedAt.get(item.id) ?? null,
  }));

  const pastAssignments = assignments.filter((assignment) => assignment.returnedAt !== null);

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        My inventory
      </h1>

      <section
        aria-labelledby="current-equipment-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2
          id="current-equipment-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Assigned to you
        </h2>
        <AssignedItemsTable rows={assignedRows} />
      </section>

      <section
        aria-labelledby="history-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="history-heading" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Assignment history
        </h2>
        <AssignmentHistoryTable rows={pastAssignments} />
      </section>
    </main>
  );
}
