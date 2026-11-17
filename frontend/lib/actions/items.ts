"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest, readApiError } from "@/lib/api";
import { flattenZodErrors } from "@/lib/flatten-zod-errors";
import {
  assignSchema,
  itemSchema,
  itemStatusSchema,
  unassignSchema,
  type AssignValues,
  type ItemInput,
  type ItemStatusValue,
  type UnassignValues,
} from "@/lib/validation";

export interface ItemActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
  success?: string;
  itemId?: string;
}

async function authedRequest(path: string, method: string, body: unknown): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return apiRequest(path, {
    method,
    headers: { cookie: cookieHeader },
    body: JSON.stringify(body),
  });
}

function revalidateItemPaths(itemId?: string): void {
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  if (itemId) {
    revalidatePath(`/inventory/${itemId}`);
    revalidatePath(`/inventory/${itemId}/edit`);
  }
}

export async function createItemAction(values: ItemInput): Promise<ItemActionState> {
  const parsed = itemSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await authedRequest("/api/items", "POST", parsed.data);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const { message, fields } = await readApiError(res);
    return { fieldErrors: fields, formError: message };
  }

  const { data } = (await res.json()) as { data: { id: string } };
  revalidateItemPaths(data.id);
  return { success: "Item created.", itemId: data.id };
}

export async function updateItemAction(id: string, values: ItemInput): Promise<ItemActionState> {
  const parsed = itemSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await authedRequest(`/api/items/${id}`, "PATCH", parsed.data);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const { message, fields } = await readApiError(res);
    return { fieldErrors: fields, formError: message };
  }

  revalidateItemPaths(id);
  return { success: "Item updated." };
}

function revalidateAssignmentPaths(holderId?: string | null): void {
  revalidatePath("/users");
  revalidatePath("/my-inventory");
  if (holderId) {
    revalidatePath(`/users/${holderId}`);
  }
}

export async function assignItemAction(id: string, values: AssignValues): Promise<ItemActionState> {
  const parsed = assignSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await authedRequest(`/api/items/${id}/assign`, "POST", parsed.data);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const { message, fields } = await readApiError(res);
    return { fieldErrors: fields, formError: message };
  }

  const { data } = (await res.json()) as {
    data: { id: string; currentHolder: { id: string } | null };
  };
  revalidateItemPaths(data.id);
  revalidateAssignmentPaths(data.currentHolder?.id);
  return { success: "Item assigned." };
}

export async function unassignItemAction(
  id: string,
  values: UnassignValues,
): Promise<ItemActionState> {
  const parsed = unassignSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await authedRequest(`/api/items/${id}/unassign`, "POST", parsed.data);
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const { message, fields } = await readApiError(res);
    return { fieldErrors: fields, formError: message };
  }

  const { data } = (await res.json()) as {
    data: { id: string; currentHolder: { id: string } | null };
  };
  revalidateItemPaths(data.id);
  revalidateAssignmentPaths(data.currentHolder?.id);
  return { success: "Item unassigned." };
}

export async function changeItemStatusAction(
  id: string,
  status: ItemStatusValue,
): Promise<ItemActionState> {
  const parsed = itemStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { formError: "That status change is not allowed." };
  }

  let res: Response;
  try {
    res = await authedRequest(`/api/items/${id}/status`, "POST", { status: parsed.data });
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const { message } = await readApiError(res);
    return { formError: message };
  }

  revalidateItemPaths(id);
  return { success: "Item status updated." };
}
