"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable, type DataTableColumn, type DataTableSort } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import type { InventoryItem, ListResponse } from "@/lib/api";
import { EMPTY_VALUE, formatDate, fullName } from "@/lib/format";
import { buildInventoryHref, type InventoryQuery, type QueryChange } from "@/lib/inventory-query";

const columns: DataTableColumn<InventoryItem>[] = [
  {
    id: "assetTag",
    header: "Asset tag",
    cell: (row) => <span className="font-mono text-xs">{row.assetTag}</span>,
    sortValue: (row) => row.assetTag,
  },
  {
    id: "name",
    header: "Name",
    cell: (row) => (
      <Link
        href={`/inventory/${row.id}`}
        className="rounded-sm font-medium underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:decoration-zinc-600 dark:hover:decoration-zinc-50 dark:focus-visible:outline-zinc-50"
      >
        {row.name}
      </Link>
    ),
    sortValue: (row) => row.name,
  },
  {
    id: "createdAt",
    header: "Added",
    cell: (row) => formatDate(row.createdAt),
    sortValue: (row) => new Date(row.createdAt).getTime(),
  },
  {
    id: "category",
    header: "Category",
    cell: (row) => row.category.name,
  },
  {
    id: "serialNumber",
    header: "Serial number",
    cell: (row) => row.serialNumber ?? EMPTY_VALUE,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: "holder",
    header: "Current holder",
    cell: (row) => (row.currentHolder ? fullName(row.currentHolder) : EMPTY_VALUE),
  },
  {
    id: "team",
    header: "Holder's team",
    cell: (row) => row.currentHolder?.team?.name ?? EMPTY_VALUE,
  },
];

export function InventoryTable({
  query,
  result,
}: {
  query: InventoryQuery;
  result: ListResponse<InventoryItem>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const currentParams = new URLSearchParams(params.toString());

  function update(changes: QueryChange) {
    router.push(buildInventoryHref(currentParams, changes), { scroll: false });
  }

  const sort: DataTableSort = {
    columnId: query.sort ?? "name",
    direction: query.order ?? "asc",
  };

  return (
    <DataTable
      columns={columns}
      data={result.data}
      getRowId={(row) => row.id}
      ariaLabel="Inventory items"
      emptyMessage="No items match the current filters. Change or clear the filters to see more items."
      server={{
        page: result.meta.page,
        pageSize: result.meta.pageSize,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        sort,
        onPageChange: (page) => update({ page: String(page) }),
        onSortChange: (next) =>
          update(
            next
              ? { sort: next.columnId, order: next.direction }
              : { sort: undefined, order: undefined },
          ),
      }}
    />
  );
}
