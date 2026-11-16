"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { changeItemStatusAction } from "@/lib/actions/items";
import type { ItemStatus } from "@/lib/api";
import type { ItemStatusValue } from "@/lib/validation";

const buttonClassName =
  "inline-flex h-10 items-center rounded-full border border-zinc-300 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50";

export function StatusActions({
  itemId,
  status,
  canRetire,
}: {
  itemId: string;
  status: ItemStatus;
  canRetire: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: ItemStatusValue) {
    setPending(true);
    setError(null);
    const result = await changeItemStatusAction(itemId, next);
    setPending(false);
    if (result.formError) {
      setError(result.formError);
    }
    router.refresh();
  }

  if (status === "RETIRED") {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This item is retired. Retired is final and no further status changes are available.
      </p>
    );
  }

  if (status === "ASSIGNED") {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This item is assigned. It must be returned before its status can be changed.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status === "AVAILABLE" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("IN_REPAIR")}
          className={buttonClassName}
        >
          Send to repair
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => change("AVAILABLE")}
          className={buttonClassName}
        >
          Back from repair
        </button>
      )}

      {canRetire ? (
        <ConfirmDialog
          label="Retire"
          title="Retire this item?"
          description="Retiring is final. The item will stay in your records but cannot be assigned again."
          confirmLabel="Yes, retire it"
          disabled={pending}
          destructive
          onConfirm={() => change("RETIRED")}
        />
      ) : null}

      {error ? (
        <p role="alert" className="w-full text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
