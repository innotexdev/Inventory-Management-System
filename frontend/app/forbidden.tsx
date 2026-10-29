import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <main className="w-full max-w-md text-center">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">403</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Not allowed
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Your role cannot open this page.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-zinc-950 px-5 py-2.5 font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
