"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null;
  searchValue?: (row: T) => string | null | undefined;
}

type SortDirection = "asc" | "desc";

interface SortState {
  columnId: string;
  direction: SortDirection;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  ariaLabel: string;
  emptyMessage?: ReactNode;
  searchable?: boolean;
  searchLabel?: string;
  pageSize?: number;
  defaultSort?: SortState;
}

const TABLE_CLASSNAME = "w-full min-w-[36rem] text-left text-sm";
const HEADER_CLASSNAME =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";
const CELL_CLASSNAME = "px-4 py-3 align-middle text-zinc-950 dark:text-zinc-50";
const BUTTON_CLASSNAME =
  "rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900";

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function sortRows<T>(
  rows: T[],
  sortValue: (row: T) => string | number | null,
  direction: SortDirection,
): T[] {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const aValue = sortValue(a);
    const bValue = sortValue(b);
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * factor;
    }
    return collator.compare(String(aValue), String(bValue)) * factor;
  });
}

function SortIndicator({ direction }: { direction: SortDirection | null }) {
  return (
    <span aria-hidden="true" className={direction ? "" : "opacity-40"}>
      {direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}
    </span>
  );
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  ariaLabel,
  emptyMessage = "Nothing to show yet.",
  searchable = false,
  searchLabel = "Search table",
  pageSize,
  defaultSort,
}: DataTableProps<T>) {
  const searchId = useId();
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const processedRows = useMemo(() => {
    let rows = data;

    const normalizedQuery = query.trim().toLowerCase();
    if (searchable && normalizedQuery) {
      rows = rows.filter((row) =>
        columns.some((column) =>
          column.searchValue?.(row)?.toLowerCase().includes(normalizedQuery),
        ),
      );
    }

    const sortColumn = sort ? columns.find((column) => column.id === sort.columnId) : undefined;
    if (sort && sortColumn?.sortValue) {
      rows = sortRows(rows, sortColumn.sortValue, sort.direction);
    }

    return rows;
  }, [data, columns, query, searchable, sort]);

  const isPaginated = pageSize !== undefined;
  const pageCount = isPaginated ? Math.max(1, Math.ceil(processedRows.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount);
  const startIndex = isPaginated ? (currentPage - 1) * pageSize : 0;
  const visibleRows = isPaginated
    ? processedRows.slice(startIndex, startIndex + pageSize)
    : processedRows;

  function toggleSort(columnId: string) {
    setSort((previous) => {
      if (previous?.columnId !== columnId) return { columnId, direction: "asc" };
      if (previous.direction === "asc") return { columnId, direction: "desc" };
      return null;
    });
    setPage(1);
  }

  if (data.length === 0) {
    return <p className="mt-2 text-zinc-600 dark:text-zinc-400">{emptyMessage}</p>;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {searchable ? (
        <div>
          <label htmlFor={searchId} className="sr-only">
            {searchLabel}
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            placeholder="Search…"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="w-full max-w-xs rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table aria-label={ariaLabel} className={TABLE_CLASSNAME}>
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {columns.map((column) => {
                const isSortable = column.sortValue !== undefined;
                const direction = sort?.columnId === column.id ? sort.direction : null;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={HEADER_CLASSNAME}
                    aria-sort={
                      isSortable
                        ? direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className="inline-flex items-center gap-1.5 uppercase tracking-wide transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        {column.header}
                        <SortIndicator direction={direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-zinc-600 dark:text-zinc-400"
                >
                  No results match your search.
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-900"
                >
                  {columns.map((column) => (
                    <td key={column.id} className={CELL_CLASSNAME}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isPaginated && processedRows.length > 0 ? (
        <div className="flex items-center justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p role="status">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, processedRows.length)} of{" "}
            {processedRows.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={BUTTON_CLASSNAME}
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className={BUTTON_CLASSNAME}
              disabled={currentPage >= pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
