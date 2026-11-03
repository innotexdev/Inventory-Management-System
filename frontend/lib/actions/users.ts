"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest, readApiError } from "@/lib/api";
import { flattenZodErrors } from "@/lib/flatten-zod-errors";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordValues,
  type UpdateProfileValues,
} from "@/lib/validation";

export interface UserActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
  success?: string;
}

async function authedRequest(path: string, method: string, body: unknown): Promise<Response> {
  const cookieHeader = (await cookies()).toString();
  return apiRequest(path, {
    method,
    headers: { cookie: cookieHeader },
    body: JSON.stringify(body),
  });
}

export async function updateProfileAction(values: UpdateProfileValues): Promise<UserActionState> {
  const parsed = updateProfileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await authedRequest("/api/users/me", "PATCH", parsed.data);
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

  revalidatePath("/profile");
  return { success: "Profile updated." };
}

export async function changePasswordAction(values: ChangePasswordValues): Promise<UserActionState> {
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await authedRequest("/api/users/me/password", "PATCH", {
      oldPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }
  if (res.status === 401) {
    redirect("/login");
  }
  if (!res.ok) {
    const { message, fields } = await readApiError(res);
    if (fields) {
      const mapped: Record<string, string> = {};
      for (const [key, value] of Object.entries(fields)) {
        mapped[key === "oldPassword" ? "currentPassword" : key] = value;
      }
      return { fieldErrors: mapped, formError: message };
    }
    return { fieldErrors: { currentPassword: "Current password is incorrect." } };
  }

  return { success: "Password changed." };
}
