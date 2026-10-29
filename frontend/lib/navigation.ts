import type { Role } from "./api";

export interface NavLink {
  href: string;
  label: string;
}

export function homePathForRole(role?: Role | null): string {
  if (role === "MANAGER" || role === "ADMIN") {
    return "/dashboard";
  }
  return "/my-inventory";
}

export function isSafeNextPath(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

export function linksForRole(role: Role | null): NavLink[] {
  if (!role) {
    return [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Register" },
    ];
  }
  if (role === "MANAGER" || role === "ADMIN") {
    return [
      { href: "/my-inventory", label: "My inventory" },
      { href: "/dashboard", label: "Dashboard" },
    ];
  }
  return [{ href: "/my-inventory", label: "My inventory" }];
}
