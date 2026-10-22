const FEATURES = [
  {
    title: "Every item accounted for",
    body: "Categories, serials, purchase dates and notes live with the item, not in a spreadsheet.",
  },
  {
    title: "One active holder",
    body: "The database refuses a second active assignment for the same item, so an item is never with two people.",
  },
  {
    title: "History, not guesses",
    body: "Assignments are returned, never deleted, so you can always see who had what and when.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-12 px-6 py-20">
      <section className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Inventory Management
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Track your hardware, who holds it, and when it comes back. The item
          catalogue and the assignment history are live — the management UI is
          the next milestone.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-black/[.08] p-5 dark:border-white/[.15]"
          >
            <h2 className="font-semibold text-black dark:text-zinc-50">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {feature.body}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-lg bg-black/[.04] p-5 font-mono text-sm text-zinc-600 dark:bg-white/[.06] dark:text-zinc-400">
        API health check:{" "}
        <span className="text-black dark:text-zinc-50">
          http://localhost:5000/api/health
        </span>
      </section>
    </main>
  );
}
