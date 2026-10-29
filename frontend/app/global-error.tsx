"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-full flex items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
        <main className="w-full max-w-md text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">500</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Application error
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Something went wrong while loading the application.
          </p>
          {error.digest ? (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => retry()}
            className="mt-6 rounded-full bg-zinc-950 px-5 py-2.5 font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
