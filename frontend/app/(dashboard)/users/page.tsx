import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import type { RawSearchParams } from "@/lib/inventory-query";
import { getTeams } from "@/lib/teams";
import { getUsers } from "@/lib/users";
import { parseUsersQuery } from "@/lib/users-query";
import { UsersFilters } from "./users-filters";
import { UsersTable } from "./users-table";

export const instant = false;

export const metadata: Metadata = {
  title: "Users",
  description: "Browse users, their roles, teams and assigned equipment",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireRole("MANAGER", "/users");

  const query = parseUsersQuery(await searchParams);
  const [result, teams] = await Promise.all([getUsers(query), getTeams()]);

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Users
      </h1>

      <UsersFilters query={query} teams={teams} />

      <section
        aria-labelledby="users-results-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="users-results-heading" className="sr-only">
          Users results
        </h2>
        <UsersTable result={result} />
      </section>
    </main>
  );
}
