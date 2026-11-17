import { cookies } from "next/headers";
import {
  apiRequest,
  type HeldItem,
  type ListResponse,
  type UserAssignment,
  type UserView,
} from "@/lib/api";
import { toApiSearchParams, type UsersQuery } from "./users-query";

async function authedGet(path: string): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return apiRequest(path, { headers: { cookie: cookieHeader } });
}

export async function getMyItems(): Promise<HeldItem[]> {
  const res = await authedGet("/api/users/me/items");
  if (!res.ok) {
    throw new Error(`GET /api/users/me/items failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: HeldItem[] };
  return data;
}

export async function getMyAssignments(): Promise<UserAssignment[]> {
  const res = await authedGet("/api/users/me/assignments");
  if (!res.ok) {
    throw new Error(`GET /api/users/me/assignments failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: UserAssignment[] };
  return data;
}

export async function getUsers(query: UsersQuery): Promise<ListResponse<UserView>> {
  const res = await authedGet(`/api/users?${toApiSearchParams(query).toString()}`);
  if (!res.ok) {
    throw new Error(`GET /api/users failed with ${res.status}`);
  }
  return (await res.json()) as ListResponse<UserView>;
}

export async function getUser(id: string): Promise<UserView | null> {
  const res = await authedGet(`/api/users/${id}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET /api/users/${id} failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: UserView };
  return data;
}

export async function getUserItems(id: string): Promise<HeldItem[]> {
  const res = await authedGet(`/api/users/${id}/items`);
  if (!res.ok) {
    throw new Error(`GET /api/users/${id}/items failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: HeldItem[] };
  return data;
}

export async function getUserAssignments(id: string): Promise<UserAssignment[]> {
  const res = await authedGet(`/api/users/${id}/assignments`);
  if (!res.ok) {
    throw new Error(`GET /api/users/${id}/assignments failed with ${res.status}`);
  }
  const { data } = (await res.json()) as { data: UserAssignment[] };
  return data;
}
