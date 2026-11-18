import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getTeams } from "@/lib/teams";
import { TeamManagement } from "./team-management";

export const metadata: Metadata = { title: "Manage teams" };
export const instant = false;

export default async function ManageTeamsPage() {
  await requireRole("ADMIN", "/teams");
  const teams = await getTeams();
  return (
    <main className="flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Manage teams</h1>
      <TeamManagement teams={teams} />
    </main>
  );
}
