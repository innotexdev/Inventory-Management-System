"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <main className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">500</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The page could not be loaded. Try again or head back home.
        </p>
        {error.digest ? (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-full bg-zinc-950 px-5 py-2.5 font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-5 py-2.5 font-medium text-zinc-950 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
