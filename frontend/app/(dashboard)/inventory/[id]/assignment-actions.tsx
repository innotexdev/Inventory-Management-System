"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssignPickerDialog, type PickerOption } from "@/components/assign-picker-dialog";
import { NoteConfirmDialog } from "@/components/note-confirm-dialog";
import { assignItemAction, unassignItemAction } from "@/lib/actions/items";
import type { ItemStatus } from "@/lib/api";

export function ItemAssignmentActions({
  itemId,
  status,
  holder,
  users,
}: {
  itemId: string;
  status: ItemStatus;
  holder: { id: string; name: string } | null;
  users: PickerOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (status === "AVAILABLE") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <AssignPickerDialog
          triggerLabel="Assign"
          title="Assign this item"
          optionLabel="users"
          options={users}
          emptyMessage="No active users found."
          onAssign={async (userId, note) => {
            const result = await assignItemAction(itemId, { userId, note });
            setError(result.formError ?? null);
            router.refresh();
            return result;
          }}
        />
        {error ? (
          <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (status === "ASSIGNED" && holder) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <NoteConfirmDialog
          label="Unassign"
          title="Unassign this item?"
          description={`This will return the item from ${holder.name}. The assignment stays in history.`}
          confirmLabel="Yes, unassign it"
          onConfirm={async (note) => {
            const result = await unassignItemAction(itemId, { note });
            setError(result.formError ?? null);
            router.refresh();
            return result;
          }}
        />
        {error ? (
          <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}
