"use client";

import { useId, useRef, useState } from "react";
import type { ItemActionState } from "@/lib/actions/items";

export interface PickerOption {
  id: string;
  title: string;
  subtitle?: string;
}

const triggerClassName =
  "inline-flex h-10 items-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50";

const secondaryButtonClassName =
  "h-10 rounded-full border border-zinc-300 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50";

const fieldClassName =
  "w-full rounded-md border border-zinc-500 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50";

export function AssignPickerDialog({
  triggerLabel,
  title,
  optionLabel,
  options,
  emptyMessage,
  disabled = false,
  onAssign,
}: {
  triggerLabel: string;
  title: string;
  optionLabel: string;
  options: PickerOption[];
  emptyMessage: string;
  disabled?: boolean;
  onAssign: (id: string, note: string) => Promise<ItemActionState>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const searchId = useId();
  const noteId = useId();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = search.trim().toLowerCase();
  const visible = options.filter((option) =>
    `${option.title} ${option.subtitle ?? ""}`.toLowerCase().includes(normalized),
  );

  function reset() {
    setSearch("");
    setSelectedId(null);
    setNote("");
    setError(null);
  }

  async function submit() {
    if (!selectedId) return;
    setPending(true);
    setError(null);
    const result = await onAssign(selectedId, note);
    setPending(false);
    if (result.formError) {
      setError(result.formError);
      return;
    }
    dialogRef.current?.close();
    reset();
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => dialogRef.current?.showModal()}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white p-6 text-zinc-950 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <label htmlFor={searchId} className="mt-4 block text-sm font-medium">
          Search {optionLabel}
        </label>
        <input
          id={searchId}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Find ${optionLabel}…`}
          className={`mt-1 ${fieldClassName}`}
        />
        <div className="mt-3 max-h-56 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-800">
          {visible.length === 0 ? (
            <p className="p-3 text-sm text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>
          ) : (
            <ul>
              {visible.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    aria-pressed={selectedId === option.id}
                    onClick={() => setSelectedId(option.id)}
                    className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50 ${
                      selectedId === option.id ? "bg-zinc-100 dark:bg-zinc-900" : ""
                    }`}
                  >
                    <span className="font-medium">{option.title}</span>
                    {option.subtitle ? (
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {option.subtitle}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <label htmlFor={noteId} className="mt-4 block text-sm font-medium">
          Note <span className="font-normal text-zinc-600 dark:text-zinc-400">(optional)</span>
        </label>
        <textarea
          id={noteId}
          rows={2}
          maxLength={250}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={`mt-1 ${fieldClassName}`}
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
              reset();
            }}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending || selectedId === null}
            onClick={submit}
            className={triggerClassName}
          >
            {pending ? "Assigning…" : "Assign"}
          </button>
        </div>
      </dialog>
    </>
  );
}
