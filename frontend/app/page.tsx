import Link from "next/link";
import { env } from "@/config";

const FEATURES = [
  {
    title: "Every item accounted for",
    body: "Category, serial number, purchase date and notes live with the item, not in a spreadsheet.",
  },
  {
    title: "One holder at a time",
    body: "The database refuses a second active assignment, so an item is never with two people.",
  },
  {
    title: "History, not guesses",
    body: "Assignments are returned, never deleted. You can always see who had what, and when.",
  },
];

const ROLES = [
  {
    name: "Employee",
    summary: "See what you hold and what you held before.",
    points: ["Your current equipment", "Your assignment history", "Your profile and password"],
  },
  {
    name: "Manager",
    summary: "See the whole company and keep equipment moving.",
    points: [
      "Every item, holder and team",
      "Assign, unassign and send to repair",
      "Spot items nobody is using",
    ],
  },
  {
    name: "Admin",
    summary: "Everything a Manager does, plus control of people and stock.",
    points: ["Manage users, roles and teams", "Retire equipment", "Deactivate leavers safely"],
  },
];

const HISTORY = [
  { who: "Amara Okafor", note: "Assigned by Tobi Adeyemi", date: "12 Mar 2026", active: true },
  { who: "Daniel Eze", note: "Returned, Frontend", date: "02 Mar 2026", active: false },
  { who: "Daniel Eze", note: "Assigned by Tobi Adeyemi", date: "14 Aug 2025", active: false },
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-zinc-950 dark:text-zinc-50">
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col items-start gap-6">
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Know who has every laptop, monitor and chair.
            </h1>
            <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Track company equipment, who holds it and when it comes back. Managers see the full
              picture. Employees see what is theirs.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/login"
                className={`inline-flex h-11 items-center rounded-full bg-zinc-950 px-6 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 ${focusRing}`}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={`inline-flex h-11 items-center rounded-full border border-zinc-300 bg-background px-6 text-sm font-medium text-zinc-950 dark:text-zinc-50 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900 ${focusRing}`}
              >
                Create account
              </Link>
            </div>
          </div>

          <figure className="m-0">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-background dark:border-zinc-800">
              <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div>
                  <p className="font-mono text-sm text-zinc-500 dark:text-zinc-400">INV-0042</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">MacBook Pro 14</p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Laptop · Apple · SN C02XK81QJG5H
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-zinc-950 dark:bg-zinc-50"
                  />
                  Assigned
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-4 border-b border-zinc-200 p-5 text-sm dark:border-zinc-800">
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Current holder</dt>
                  <dd className="mt-1 font-medium">Amara Okafor</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">Team</dt>
                  <dd className="mt-1 font-medium">Frontend</dd>
                </div>
              </dl>

              <div className="p-5">
                <p className="text-sm font-medium">Assignment history</p>
                <ol className="mt-4 flex flex-col">
                  {HISTORY.map((entry, i) => (
                    <li
                      key={`${entry.who}-${entry.date}`}
                      className="relative flex gap-4 pb-5 last:pb-0"
                    >
                      {i < HISTORY.length - 1 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-[5px] top-3 h-full w-px bg-zinc-200 dark:bg-zinc-700"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border-2 ${
                          entry.active
                            ? "border-zinc-950 bg-zinc-950 dark:border-zinc-50 dark:bg-zinc-50"
                            : "border-zinc-300 bg-background dark:border-zinc-700"
                        }`}
                      />
                      <div className="flex flex-1 items-baseline justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium">{entry.who}</p>
                          <p className="text-zinc-500 dark:text-zinc-400">{entry.note}</p>
                        </div>
                        <p className="shrink-0 text-zinc-500 dark:text-zinc-400">{entry.date}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </figure>
        </section>

        <section className="border-y border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto w-full max-w-6xl px-6 py-16">
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Built around a few rules that cannot be broken.
            </h2>
            <ul role="list" className="mt-10 grid gap-10 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="border-t-2 border-zinc-950 pt-5 dark:border-zinc-50"
                >
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            The right view for each person.
          </h2>
          <p className="mt-3 max-w-lg text-zinc-600 dark:text-zinc-400">
            Permissions are checked on the server for every request, so people only see what their
            role allows.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ROLES.map((role) => (
              <article
                key={role.name}
                className="flex flex-col rounded-xl border border-zinc-200 bg-background p-6 dark:border-zinc-800"
              >
                <h3 className="text-lg font-semibold tracking-tight">{role.name}</h3>
                <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {role.summary}
                </p>
                <ul
                  role="list"
                  className="mt-5 flex flex-col gap-2.5 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800"
                >
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-950 dark:text-zinc-50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 8.5l3.2 3L13 4.5" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
          <p>Inventory Management</p>
          {process.env.NODE_ENV !== "production" && (
            <p className="font-mono text-xs">
              API health:{" "}
              <span className="text-zinc-950 dark:text-zinc-50">
                {env.NEXT_PUBLIC_API_URL}/api/health
              </span>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
