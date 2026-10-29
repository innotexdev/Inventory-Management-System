"use client";

import { useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await logoutAction();
        })
      }
      disabled={pending}
      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
    >
      {pending ? "Signing out…" : "Log out"}
    </button>
  );
}
