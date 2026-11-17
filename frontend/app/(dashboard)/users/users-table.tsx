"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import type { ListResponse, UserView } from "@/lib/api";
import { formatDate, fullName } from "@/lib/format";
import { buildUsersHref, type QueryChange } from "@/lib/users-query";

const columns: DataTableColumn<UserView>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => (
      <Link
        href={`/users/${row.id}`}
        className="rounded-sm font-medium underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:decoration-zinc-600 dark:hover:decoration-zinc-50 dark:focus-visible:outline-zinc-50"
      >
        {fullName(row)}
      </Link>
    ),
    sortValue: (row) => fullName(row),
  },
  {
    id: "email",
    header: "Email",
    cell: (row) => row.email,
    sortValue: (row) => row.email,
  },
  {
    id: "role",
    header: "Role",
    cell: (row) => row.role,
    sortValue: (row) => row.role,
  },
  {
    id: "team",
    header: "Team",
    cell: (row) => row.team?.name ?? "No team",
    sortValue: (row) => row.team?.name ?? "No team",
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (row.isActive ? "Active" : "Inactive"),
    sortValue: (row) => (row.isActive ? "Active" : "Inactive"),
  },
  {
    id: "items",
    header: "Items held",
    cell: (row) => row.heldItemsCount,
    sortValue: (row) => row.heldItemsCount,
  },
  {
    id: "createdAt",
    header: "Added",
    cell: (row) => formatDate(row.createdAt),
    sortValue: (row) => new Date(row.createdAt).getTime(),
  },
];

export function UsersTable({ result }: { result: ListResponse<UserView> }) {
  const router = useRouter();
  const params = useSearchParams();
  const currentParams = new URLSearchParams(params.toString());

  function update(changes: QueryChange) {
    router.push(buildUsersHref(currentParams, changes), { scroll: false });
  }

  return (
    <DataTable
      columns={columns}
      data={result.data}
      getRowId={(row) => row.id}
      ariaLabel="Users"
      emptyMessage="No users match the current filters. Change or clear the filters to see more users."
      server={{
        page: result.meta.page,
        pageSize: result.meta.pageSize,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        sort: null,
        onPageChange: (page) => update({ page: String(page) }),
        onSortChange: () => undefined,
      }}
    />
  );
}
