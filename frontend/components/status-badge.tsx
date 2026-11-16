import type { ItemStatus } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/inventory-query";

const statusTone: Record<ItemStatus, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  ASSIGNED: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  IN_REPAIR: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  RETIRED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusTone[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
