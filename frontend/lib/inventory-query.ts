import { z } from "zod";

export const INVENTORY_PAGE_SIZE = 20;

export const STATUSES = ["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED"] as const;
export const SORT_FIELDS = ["name", "assetTag", "createdAt"] as const;
export const SORT_ORDERS = ["asc", "desc"] as const;

export const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  IN_REPAIR: "In repair",
  RETIRED: "Retired",
};

export const inventoryQuerySchema = z.object({
  search: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(STATUSES).optional().catch(undefined),
  categoryId: z.uuid().optional().catch(undefined),
  teamId: z.uuid().optional().catch(undefined),
  holderId: z.uuid().optional().catch(undefined),
  sort: z.enum(SORT_FIELDS).optional().catch(undefined),
  order: z.enum(SORT_ORDERS).optional().catch(undefined),
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().max(100).catch(INVENTORY_PAGE_SIZE),
});

export type InventoryQuery = z.infer<typeof inventoryQuerySchema>;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseInventoryQuery(raw: RawSearchParams): InventoryQuery {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return inventoryQuerySchema.parse(flat);
}

export function toApiSearchParams(query: InventoryQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.categoryId) params.set("categoryId", query.categoryId);
  if (query.teamId) params.set("teamId", query.teamId);
  if (query.holderId) params.set("holderId", query.holderId);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params;
}

export type QueryChange = Partial<Record<keyof InventoryQuery, string | undefined>>;

export function buildInventoryHref(current: URLSearchParams, changes: QueryChange): string {
  const next = new URLSearchParams(current.toString());
  const isPageOnlyChange = Object.keys(changes).every((key) => key === "page");

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
  }

  if (!isPageOnlyChange) next.delete("page");

  const search = next.toString();
  return search ? `/inventory?${search}` : "/inventory";
}

const QUERY_KEYS: (keyof InventoryQuery)[] = [
  "search",
  "status",
  "categoryId",
  "teamId",
  "holderId",
  "sort",
  "order",
  "page",
  "pageSize",
];

export function hasActiveConstraints(params: URLSearchParams): boolean {
  return QUERY_KEYS.some((key) => params.has(key) && params.get(key) !== "");
}
