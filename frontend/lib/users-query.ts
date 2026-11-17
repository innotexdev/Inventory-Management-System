import { z } from "zod";
import type { RawSearchParams } from "./inventory-query";

export const USERS_PAGE_SIZE = 20;

export const ROLES = ["EMPLOYEE", "MANAGER", "ADMIN"] as const;

export const ROLE_LABELS: Record<(typeof ROLES)[number], string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

export const usersQuerySchema = z.object({
  search: z.string().trim().max(100).optional().catch(undefined),
  teamId: z.uuid().optional().catch(undefined),
  role: z.enum(ROLES).optional().catch(undefined),
  isActive: z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean().optional().catch(undefined),
  ),
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().max(100).catch(USERS_PAGE_SIZE),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;

export function parseUsersQuery(raw: RawSearchParams): UsersQuery {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return usersQuerySchema.parse(flat);
}

export function toApiSearchParams(query: UsersQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.teamId) params.set("teamId", query.teamId);
  if (query.role) params.set("role", query.role);
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive));
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params;
}

export type QueryChange = Partial<Record<keyof UsersQuery, string | undefined>>;

export function buildUsersHref(current: URLSearchParams, changes: QueryChange): string {
  const next = new URLSearchParams(current.toString());
  const isPageOnlyChange = Object.keys(changes).every((key) => key === "page");

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
  }

  if (!isPageOnlyChange) next.delete("page");

  const search = next.toString();
  return search ? `/users?${search}` : "/users";
}

const QUERY_KEYS: (keyof UsersQuery)[] = [
  "search",
  "teamId",
  "role",
  "isActive",
  "page",
  "pageSize",
];

export function hasActiveConstraints(params: URLSearchParams): boolean {
  return QUERY_KEYS.some((key) => params.has(key) && params.get(key) !== "");
}
