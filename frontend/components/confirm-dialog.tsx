"use client";

import { useId, useRef } from "react";

export function ConfirmDialog({
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
  disabled = false,
  destructive = false,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => dialogRef.current?.showModal()}
        className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50 ${
          destructive
            ? "bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500"
            : "bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        }`}
      >
        {label}aaaaa
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-xl backdrop:bg-black/90 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              try {
                await onConfirm();
              } finally {
                dialogRef.current?.close();
              }
            }}
            className={`h-10 rounded-full px-4 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50 ${
              destructive ? "bg-red-700 hover:bg-red-800" : "bg-zinc-950 hover:bg-zinc-800"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
