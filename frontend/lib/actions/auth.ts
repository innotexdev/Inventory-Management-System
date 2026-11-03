"use server";

import { redirect } from "next/navigation";
import { apiRequest, readApiError, type CurrentUser } from "@/lib/api";
import { deleteSessionCookie, forwardSessionCookie } from "@/lib/cookie";
import { flattenZodErrors } from "@/lib/flatten-zod-errors";
import { homePathForRole } from "@/lib/navigation";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validation";
import { isSafeNextPath } from "@/lib/safe-path";

export interface AuthActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
}

function safeRedirectTarget(nextPath: string | undefined): string | null {
  if (!nextPath || nextPath === "/" || !isSafeNextPath(nextPath)) {
    return null;
  }
  return nextPath;
}

async function postAuth(
  path: string,
  body: LoginValues | RegisterValues,
): Promise<{ user: CurrentUser } | { error: AuthActionState }> {
  let res: Response;
  try {
    res = await apiRequest(path, { method: "POST", body: JSON.stringify(body) });
  } catch {
    return { error: { formError: "Could not reach the server. Try again." } };
  }
  if (!res.ok) {
    const { message, fields } = await readApiError(res);
    return { error: { fieldErrors: fields, formError: message } };
  }
  await forwardSessionCookie(res);
  const { data } = (await res.json()) as { data: CurrentUser };
  return { user: data };
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

  const result = await postAuth("/api/auth/login", parsed.data);
  if ("error" in result) return result.error;

  redirect(safeRedirectTarget(nextPath) ?? homePathForRole(result.user.role));
}

export async function registerAction(values: RegisterValues): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      fieldErrors: flattenZodErrors(parsed.error),
      formError: "Please fix the highlighted fields.",
    };
  }

  const result = await postAuth("/api/auth/register", parsed.data);
  if ("error" in result) return result.error;

  redirect(homePathForRole(result.user.role));
}

export async function logoutAction(): Promise<void> {
  await deleteSessionCookie();
  redirect("/login");
}
