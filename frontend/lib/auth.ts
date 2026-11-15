import { cache } from "react";
import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { apiRequest, type CurrentUser, type Role } from "./api";
import { isSafeNextPath } from "./safe-path";

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

  const res = await apiRequest("/api/auth/me", { headers: { cookie: cookieHeader } });
  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`GET /api/auth/me failed with ${res.status}`);
  }

  const { data } = (await res.json()) as { data: CurrentUser };
  return data;
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

export async function requireRole(minRole: Role, nextPath?: string): Promise<CurrentUser> {
  const user = await requireUser(nextPath);
  if (!hasMinRole(user.role, minRole)) {
    forbidden();
  }
  return user;
}
