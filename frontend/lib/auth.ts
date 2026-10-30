import { cache } from "react";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { apiRequest, type CurrentUser, type Role } from "./api";
import { isSafeNextPath } from "./safe-path";

export type { CurrentUser, Role } from "./api";

const RANK: Record<Role, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export function hasMinRole(role: Role | null | undefined, minimumRole: Role): boolean {
  return role != null && RANK[role] >= RANK[minimumRole];
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieHeader = (await cookies()).toString();
  try {
    const res = await apiRequest("/api/auth/me", { headers: { cookie: cookieHeader } });
    if (res.status === 401) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`GET /api/auth/me failed with ${res.status}`);
    }

    const body = (await res.json()) as { data: CurrentUser };
    return body.data;
  } catch {
    return null;
  }
});

export async function requireUser(nextPath?: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      nextPath && isSafeNextPath(nextPath)
        ? `/login?next=${encodeURIComponent(nextPath)}`
        : "/login",
    );
  }
  return user;
}

export async function requireRole(allowed: Role[], nextPath?: string): Promise<CurrentUser> {
  const user = await requireUser(nextPath);

  const requiredRank = Math.min(...allowed.map((role) => RANK[role]));

  if (RANK[user.role] < requiredRank) {
    forbidden();
  }

  return user;
}
