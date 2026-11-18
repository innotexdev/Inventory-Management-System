import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getTeams } from "@/lib/teams";
import { getUsers } from "@/lib/users";
import { TeamsTable } from "./teams-table";

export const metadata: Metadata = { title: "Teams" };
export const instant = false;

export default async function TeamsPage() {
  const user = await requireRole("MANAGER", "/teams");
  const [teams, users] = await Promise.all([getTeams(), getUsers({ page: 1, pageSize: 100 })]);
  const usersWithoutTeam = users.data.filter((member) => member.teamId === null);

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
        {user.role === "ADMIN" ? (
          <Link
            href="/teams/manage"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
          >
            Manage teams
          </Link>
        ) : null}
      </div>

      <section
        aria-label="Teams and members"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <TeamsTable teams={teams} usersWithoutTeam={usersWithoutTeam} />
      </section>
    </main>
  );
}
