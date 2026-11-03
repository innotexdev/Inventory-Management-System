import { cookies } from "next/headers";
import { apiRequest, type HeldItem, type UserAssignment } from "@/lib/api";

async function authedGet(path: string): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return apiRequest(path, { headers: { cookie: cookieHeader } });
}

export async function getMyItems(): Promise<HeldItem[]> {
  const res = await authedGet("/api/users/me/items");
  if (!res.ok) {
    throw new Error(`GET /api/users/me/items failed with ${res.status}`);
  }
  return (await res.json()) as HeldItem[];
}

export async function getMyAssignments(): Promise<UserAssignment[]> {
  const res = await authedGet("/api/users/me/assignments");
  if (!res.ok) {
    throw new Error(`GET /api/users/me/assignments failed with ${res.status}`);
  }
  return (await res.json()) as UserAssignment[];
}
