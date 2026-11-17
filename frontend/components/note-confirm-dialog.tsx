"use client";

import { useId, useRef, useState } from "react";
import type { ItemActionState } from "@/lib/actions/items";

const destructiveTriggerClassName =
  "inline-flex h-10 items-center rounded-full bg-red-700 px-4 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-red-600 dark:hover:bg-red-500 dark:focus-visible:outline-zinc-50";

const secondaryButtonClassName =
  "h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50";

export function NoteConfirmDialog({
  label,
  title,
  description,
  confirmLabel,
  disabled = false,
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  disabled?: boolean;
  onConfirm: (note: string) => Promise<ItemActionState>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const noteId = useId();
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    const result = await onConfirm(note);
    setPending(false);
    if (result.formError) {
      setError(result.formError);
      return;
    }
    dialogRef.current?.close();
    setNote("");
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => dialogRef.current?.showModal()}
        className={destructiveTriggerClassName}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <label htmlFor={noteId} className="mt-4 block text-sm font-medium">
          Note <span className="font-normal text-zinc-600 dark:text-zinc-400">(optional)</span>
        </label>
        <textarea
          id={noteId}
          rows={2}
          maxLength={250}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-500 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50"
        />
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              setNote("");
              setError(null);
            }}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={confirm}
            className="h-10 rounded-full bg-red-700 px-4 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-red-600 dark:hover:bg-red-500 dark:focus-visible:outline-zinc-50"
          >
            {pending ? "Working…" : confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
