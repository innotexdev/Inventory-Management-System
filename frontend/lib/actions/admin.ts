"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest, readApiError } from "@/lib/api";

export interface AdminActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
  success?: string;
}

async function authedRequest(path: string, method: string, body?: unknown): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return apiRequest(path, {
    method,
    headers: { cookie: cookieHeader },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function updateUserAdminAction(
  userId: string,
  values: { role?: "EMPLOYEE" | "MANAGER" | "ADMIN"; teamId?: string | null; isActive?: boolean },
): Promise<AdminActionState> {
  let res: Response;
  try {
    res = await authedRequest(`/api/users/${userId}`, "PATCH", values);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const detail = await readApiError(res);
    return { fieldErrors: detail.fields, formError: detail.message };
  }
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
  revalidatePath("/teams");
  return { success: "User updated." };
}

export async function createTeamAction(values: {
  name: string;
  description?: string | null;
}): Promise<AdminActionState> {
  let res: Response;
  try {
    res = await authedRequest("/api/teams", "POST", values);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const detail = await readApiError(res);
    return { fieldErrors: detail.fields, formError: detail.message };
  }
  revalidatePath("/teams");
  revalidatePath("/teams/manage");
  return { success: "Team created." };
}

export async function updateTeamAction(
  teamId: string,
  values: { name?: string; description?: string | null },
): Promise<AdminActionState> {
  let res: Response;
  try {
    res = await authedRequest(`/api/teams/${teamId}`, "PATCH", values);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const detail = await readApiError(res);
    return { fieldErrors: detail.fields, formError: detail.message };
  }
  revalidatePath("/teams");
  revalidatePath("/teams/manage");
  return { success: "Team updated." };
}

export async function deleteTeamAction(teamId: string): Promise<AdminActionState> {
  let res: Response;
  try {
    res = await authedRequest(`/api/teams/${teamId}`, "DELETE");
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const detail = await readApiError(res);
    return { formError: detail.message };
  }
  revalidatePath("/teams");
  revalidatePath("/teams/manage");
  return { success: "Team deleted." };
}
