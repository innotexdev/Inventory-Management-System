import { cache } from "react";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { apiRequest, type CurrentUser, type Role } from "./api";
import { homePathForRole, isSafeNextPath } from "./navigation";

export type { CurrentUser, Role } from "./api";
export { homePathForRole, isSafeNextPath };

const RANK: Record<Role, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieHeader = (await cookies()).toString();
  try {
    const res = await apiRequest("/api/auth/me", { headers: { cookie: cookieHeader } });
    if (!res.ok) {
      return null;
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
    redirect(nextPath && isSafeNextPath(nextPath) ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }
  return user;
}

export async function requireRole(...allowed: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  const requiredRank = Math.min(...allowed.map((role) => RANK[role]));
  if (RANK[user.role] < requiredRank) {
    forbidden();
  }
  return user;
}
