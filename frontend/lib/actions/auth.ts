"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { ZodError } from "zod";
import { apiRequest, readApiError, type CurrentUser } from "@/lib/api";
import { applyResponseCookies, clearSessionCookie } from "@/lib/cookie";
import { homePathForRole, isSafeNextPath } from "@/lib/navigation";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validation";

export interface AuthActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
}

function flattenZodErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fields[key] ??= issue.message;
  }
  return fields;
}

function safeRedirectTarget(nextPath: string | undefined): string | null {
  if (!nextPath || nextPath === "/" || !isSafeNextPath(nextPath)) {
    return null;
  }
  return nextPath;
}

export async function loginAction(
  values: LoginValues,
  nextPath?: string,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }

  if (!res.ok) {
    const error = await readApiError(res);
    return { fieldErrors: error.fields, formError: error.message };
  }

  await applyResponseCookies(res);
  const { data } = (await res.json()) as { data: CurrentUser };
  redirect(safeRedirectTarget(nextPath) ?? homePathForRole(data.role));
}

export async function registerAction(values: RegisterValues): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  let res: Response;
  try {
    res = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
  } catch {
    return { formError: "Could not reach the server. Try again." };
  }

  if (!res.ok) {
    const error = await readApiError(res);
    return { fieldErrors: error.fields, formError: error.message };
  }

  await applyResponseCookies(res);
  redirect("/my-inventory");
}

export async function logoutAction(): Promise<void> {
  const cookieHeader = (await cookies()).toString();
  try {
    const res = await apiRequest("/api/auth/logout", {
      method: "POST",
      headers: { cookie: cookieHeader },
    });
    await applyResponseCookies(res);
  } catch {
    void 0;
  }
  await clearSessionCookie("sid");
  redirect("/login");
}
