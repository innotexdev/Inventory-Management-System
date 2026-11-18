"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import type { TeamView, UserView } from "@/lib/api";
import { EMPTY_VALUE, fullName } from "@/lib/format";

type TeamMember = Pick<
  TeamView["members"][number],
  "id" | "firstName" | "lastName" | "heldItemsCount"
>;

interface TeamTableRow {
  id: string;
  name: string;
  description: string | null;
  members: TeamMember[];
  memberCount: number;
  heldItemsCount: number;
}

const columns: DataTableColumn<TeamTableRow>[] = [
  {
    id: "name",
    header: "Team",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
    searchValue: (row) => row.name,
  },
  {
    id: "description",
    header: "Description",
    cell: (row) => row.description ?? EMPTY_VALUE,
    sortValue: (row) => row.description ?? "",
    searchValue: (row) => row.description,
  },
  {
    id: "members",
    header: "Members",
    cell: (row) => (
      <div>
        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">{row.memberCount} member(s)</p>
        {row.members.length === 0 ? (
          "No members."
        ) : (
          <ul className="flex flex-col gap-1">
            {row.members.map((member) => (
              <li key={member.id}>
                <Link
                  className="rounded-sm underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:decoration-zinc-600 dark:hover:decoration-zinc-50 dark:focus-visible:outline-zinc-50"
                  href={`/users/${member.id}`}
                >
                  {fullName(member)} — {member.heldItemsCount} item(s)
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
    sortValue: (row) => row.memberCount,
    searchValue: (row) => row.members.map(fullName).join(" "),
  },
  {
    id: "heldItemsCount",
    header: "Items held",
    cell: (row) => row.heldItemsCount,
    sortValue: (row) => row.heldItemsCount,
  },
];

export function TeamsTable({
  teams,
  usersWithoutTeam,
}: {
  teams: TeamView[];
  usersWithoutTeam: UserView[];
}) {
  const rows: TeamTableRow[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description,
    members: team.members,
    memberCount: team.memberCount,
    heldItemsCount: team.heldItemsCount,
  }));

  if (usersWithoutTeam.length > 0) {
    rows.push({
      id: "no-team",
      name: "No team",
      description: null,
      members: usersWithoutTeam,
      memberCount: usersWithoutTeam.length,
      heldItemsCount: usersWithoutTeam.reduce((total, member) => total + member.heldItemsCount, 0),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      ariaLabel="Teams"
      emptyMessage="No teams or members found."
      searchable
    />
  );
}
