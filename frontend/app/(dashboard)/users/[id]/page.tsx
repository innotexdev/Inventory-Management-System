import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { formatDate, fullName } from "@/lib/format";
import { getAvailableItems } from "@/lib/inventory";
import { getUser, getUserAssignments, getUserItems } from "@/lib/users";
import {
  AssignedItemsTable,
  AssignmentHistoryTable,
  type AssignedItemRow,
} from "../../my-inventory/inventory-tables";
import { UserAssignmentActions } from "./user-assignment-actions";

export const instant = false;

export const metadata: Metadata = {
  title: "User detail",
  description: "User profile, assigned equipment and assignment history",
};

const sectionClassName =
  "rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950";

const backLinkClassName =
  "rounded-sm text-sm font-medium text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("MANAGER", "/users");
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const user = await getUser(id);
  if (!user) {
    notFound();
  }

  const [items, assignments, availableItems] = await Promise.all([
    getUserItems(id),
    getUserAssignments(id),
    getAvailableItems(),
  ]);

  const assignedAtById = new Map<string, string>();
  for (const assignment of assignments) {
    if (assignment.returnedAt === null) {
      assignedAtById.set(assignment.item.id, assignment.assignedAt);
    }
  }

  const currentRows: AssignedItemRow[] = items.map((item) => ({
    ...item,
    assignedAt: assignedAtById.get(item.id) ?? null,
  }));

  const details: { label: string; value: string }[] = [
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
    { label: "Team", value: user.team?.name ?? "No team" },
    { label: "Status", value: user.isActive ? "Active" : "Inactive" },
    { label: "Created", value: formatDate(user.createdAt) },
    { label: "Items held", value: String(user.heldItemsCount) },
  ];

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Link href="/users" className={`self-start ${backLinkClassName}`}>
        Back to users
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {fullName(user)}
      </h1>

      <section aria-labelledby="user-profile-heading" className={sectionClassName}>
        <h2
          id="user-profile-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Profile
        </h2>
        <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">{detail.label}</dt>
              <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="user-assignments-heading" className={sectionClassName}>
        <h2
          id="user-assignments-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Equipment assignments
        </h2>
        <div className="mt-4">
          <UserAssignmentActions
            userId={user.id}
            availableItems={availableItems.map((item) => ({
              id: item.id,
              title: `${item.assetTag} · ${item.name}`,
              subtitle: item.category.name,
            }))}
            heldItems={items.map((item) => ({
              id: item.id,
              label: `${item.assetTag} · ${item.name}`,
            }))}
          />
        </div>
      </section>

      <section aria-labelledby="user-current-heading" className={sectionClassName}>
        <h2
          id="user-current-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Current equipment
        </h2>
        <AssignedItemsTable rows={currentRows} />
      </section>

      <section aria-labelledby="user-history-heading" className={sectionClassName}>
        <h2
          id="user-history-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Assignment history
        </h2>
        <AssignmentHistoryTable rows={assignments} />
      </section>
    </main>
  );
}
