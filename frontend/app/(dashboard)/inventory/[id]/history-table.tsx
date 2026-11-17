"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import type { ItemAssignment } from "@/lib/api";
import { EMPTY_VALUE, formatDate, fullName } from "@/lib/format";

const columns: DataTableColumn<ItemAssignment>[] = [
  {
    id: "holder",
    header: "Holder",
    cell: (row) => fullName(row.user),
    sortValue: (row) => fullName(row.user),
    searchValue: (row) => fullName(row.user),
  },
  {
    id: "assignedAt",
    header: "Assigned",
    cell: (row) => formatDate(row.assignedAt),
    sortValue: (row) => new Date(row.assignedAt).getTime(),
  },
  {
    id: "assignedBy",
    header: "Assigned by",
    cell: (row) => fullName(row.assignedBy),
    sortValue: (row) => fullName(row.assignedBy),
  },
  {
    id: "returnedAt",
    header: "Returned",
    cell: (row) => formatDate(row.returnedAt),
    sortValue: (row) => (row.returnedAt === null ? null : new Date(row.returnedAt).getTime()),
  },
  {
    id: "returnedBy",
    header: "Returned by",
    cell: (row) => (row.returnedBy ? fullName(row.returnedBy) : EMPTY_VALUE),
    sortValue: (row) => (row.returnedBy ? fullName(row.returnedBy) : null),
  },
  {
    id: "note",
    header: "Note",
    cell: (row) => row.note ?? EMPTY_VALUE,
    searchValue: (row) => row.note,
  },
];

export function ItemHistoryTable({ rows }: { rows: ItemAssignment[] }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      ariaLabel="Assignment history for this item"
      emptyMessage="This item has no assignment history yet."
      searchable
      searchLabel="Search this item's assignment history"
      pageSize={10}
    />
  );
}
