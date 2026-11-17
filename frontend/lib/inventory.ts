import { cookies } from "next/headers";
import {
  apiRequest,
  type CategoryView,
  type InventoryItem,
  type InventoryStats,
  type ItemAssignment,
  type ListResponse,
} from "@/lib/api";
import { toApiSearchParams, type InventoryQuery } from "./inventory-query";

async function authedGet(path: string): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return apiRequest(path, { headers: { cookie: cookieHeader } });
}

export async function getItems(query: InventoryQuery): Promise<ListResponse<InventoryItem>> {
  const res = await authedGet(`/api/items?${toApiSearchParams(query).toString()}`);
  if (!res.ok) {
    throw new Error(`GET /api/items failed with ${res.status}`);
  }
  return (await res.json()) as ListResponse<InventoryItem>;
}

export async function getItem(id: string): Promise<InventoryItem | null> {
  const res = await authedGet(`/api/items/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET /api/items/${id} failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: InventoryItem };
  return data;
}

export async function getItemAssignments(id: string): Promise<ItemAssignment[]> {
  const res = await authedGet(`/api/items/${id}/assignments`);
  if (!res.ok) {
    throw new Error(`GET /api/items/${id}/assignments failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: ItemAssignment[] };
  return data;
}

export async function getCategories(): Promise<CategoryView[]> {
  const res = await authedGet("/api/categories");
  if (!res.ok) {
    throw new Error(`GET /api/categories failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: CategoryView[] };
  return data;
}

export async function getAvailableItems(): Promise<InventoryItem[]> {
  const params = new URLSearchParams({ status: "AVAILABLE", pageSize: "100", sort: "name" });
  const res = await authedGet(`/api/items?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`GET /api/items (available) failed with ${res.status}`);
  }
  const { data } = (await res.json()) as ListResponse<InventoryItem>;
  return data;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const res = await authedGet("/api/stats/inventory");
  if (!res.ok) {
    throw new Error(`GET /api/stats/inventory failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: InventoryStats };
  return data;
}
