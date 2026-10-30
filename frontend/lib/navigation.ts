import type { Role } from "./api";
import { hasMinRole } from "./auth";

export interface NavLink {
  href: string;
  label: string;
}

export function homePathForRole(role?: Role | null): string {
  if (hasMinRole(role, "MANAGER")) {
    return "/dashboard";
  }
  return "/my-inventory";
}

export function linksForRole(role: Role | null): NavLink[] {
  if (!role) {
    return [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Register" },
    ];
  }
  if (hasMinRole(role, "MANAGER")) {
    return [
      { href: "/my-inventory", label: "My inventory" },
      { href: "/dashboard", label: "Dashboard" },
    ];
  }
  return [{ href: "/my-inventory", label: "My inventory" }];
}
