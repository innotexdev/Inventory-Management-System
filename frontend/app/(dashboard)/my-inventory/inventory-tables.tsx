"use client";

import { DataTable, type DataTableColumn } from "@/components/data-table";
import type { getMyAssignments, getMyItems } from "@/lib/users";

type Item = Awaited<ReturnType<typeof getMyItems>>[number];
type Assignment = Awaited<ReturnType<typeof getMyAssignments>>[number];

export type AssignedItemRow = Item & { assignedAt: string | null };

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

const EMPTY = "—";

function formatDate(value: string | null) {
  return value === null ? EMPTY : dateFormatter.format(new Date(value));
}

function toTimestamp(value: string | null) {
  return value === null ? null : new Date(value).getTime();
}

function fullName(person: { firstName: string; lastName: string } | null) {
  return person === null ? null : `${person.firstName} ${person.lastName}`;
}

const assignedItemColumns: DataTableColumn<AssignedItemRow>[] = [
  {
    id: "assetTag",
    header: "Asset tag",
    cell: (row) => row.assetTag,
    sortValue: (row) => row.assetTag,
    searchValue: (row) => row.assetTag,
  },
  {
    id: "name",
    header: "Item",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
    searchValue: (row) => row.name,
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => row.category.name,
    sortValue: (row) => row.category.name,
    searchValue: (row) => row.category.name,
  },
  {
    id: "serialNumber",
    header: "Serial number",
    cell: (row) => row.serialNumber ?? EMPTY,
    sortValue: (row) => row.serialNumber,
    searchValue: (row) => row.serialNumber,
  },
  {
    id: "assignedAt",
    header: "Assigned",
    cell: (row) => formatDate(row.assignedAt),
    sortValue: (row) => toTimestamp(row.assignedAt),
  },
];

const historyColumns: DataTableColumn<Assignment>[] = [
  {
    id: "item",
    header: "Item",
    cell: (row) => row.item.name,
    sortValue: (row) => row.item.name,
    searchValue: (row) => row.item.name,
  },
  {
    id: "assetTag",
    header: "Asset tag",
    cell: (row) => row.item.assetTag,
    sortValue: (row) => row.item.assetTag,
    searchValue: (row) => row.item.assetTag,
  },
  {
    id: "assignedAt",
    header: "Assigned",
    cell: (row) => formatDate(row.assignedAt),
    sortValue: (row) => toTimestamp(row.assignedAt),
  },
  {
    id: "returnedAt",
    header: "Returned",
    cell: (row) => formatDate(row.returnedAt),
    sortValue: (row) => toTimestamp(row.returnedAt),
  },
  {
    id: "assignedBy",
    header: "Assigned by",
    cell: (row) => fullName(row.assignedBy) ?? EMPTY,
    sortValue: (row) => fullName(row.assignedBy),
    searchValue: (row) => fullName(row.assignedBy),
  },
  {
    id: "returnedBy",
    header: "Returned by",
    cell: (row) => fullName(row.returnedBy) ?? EMPTY,
    sortValue: (row) => fullName(row.returnedBy),
    searchValue: (row) => fullName(row.returnedBy),
  },
  {
    id: "note",
    header: "Note",
    cell: (row) => row.note ?? EMPTY,
    searchValue: (row) => row.note,
  },
];

export function AssignedItemsTable({ rows }: { rows: AssignedItemRow[] }) {
  return (
    <DataTable
      columns={assignedItemColumns}
      data={rows}
      getRowId={(row) => row.id}
      ariaLabel="Items currently assigned to you"
      emptyMessage="Nothing is assigned to you yet. When a manager or admin assigns equipment to you, it will appear here."
    />
  );
}

export function AssignmentHistoryTable({ rows }: { rows: Assignment[] }) {
  return (
    <DataTable
      columns={historyColumns}
      data={rows}
      getRowId={(row) => row.id}
      ariaLabel="Your past assignments"
      emptyMessage="No past assignments yet. Equipment you return in the future will be listed here."
      pageSize={10}
      defaultSort={{ columnId: "assignedAt", direction: "desc" }}
    />
  );
}
