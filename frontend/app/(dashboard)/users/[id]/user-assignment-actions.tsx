"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssignPickerDialog, type PickerOption } from "@/components/assign-picker-dialog";
import { NoteConfirmDialog } from "@/components/note-confirm-dialog";
import { assignItemAction, unassignItemAction } from "@/lib/actions/items";

export function UserAssignmentActions({
  userId,
  availableItems,
  heldItems,
}: {
  userId: string;
  availableItems: PickerOption[];
  heldItems: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <AssignPickerDialog
          triggerLabel="Assign item"
          title="Assign an item to this user"
          optionLabel="items"
          options={availableItems}
          emptyMessage="No available items found. Return an item to inventory first."
          onAssign={async (itemId, note) => {
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

      {heldItems.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This user is not holding any equipment yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {heldItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {item.label}
              </span>
              <NoteConfirmDialog
                label="Unassign"
                title="Unassign this item?"
                description={`Return ${item.label} to inventory. The assignment stays in history.`}
                confirmLabel="Yes, unassign it"
                onConfirm={async (note) => {
                  const result = await unassignItemAction(item.id, { note });
                  setError(result.formError ?? null);
                  router.refresh();
                  return result;
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
