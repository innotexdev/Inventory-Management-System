export function PageSkeleton({
  label,
  title,
  blocks = 2,
}: {
  label: string;
  title: string;
  blocks?: number;
}) {
  return (
    <main
      className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10"
      role="status"
      aria-label={label}
    >
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {title}
      </h1>
      {Array.from({ length: blocks }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-64 rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        />
      ))}
      <span className="sr-only">{label}…</span>
    </main>
  );
}
