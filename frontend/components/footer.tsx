"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return String(new Date().getFullYear());
}

function getServerSnapshot() {
  return "";
}

export function Footer() {
  const year = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>Inventory Management</p>

        <p className="font-mono text-xs">© {year} All Rights Reserved</p>
      </div>
    </footer>
  );
}
