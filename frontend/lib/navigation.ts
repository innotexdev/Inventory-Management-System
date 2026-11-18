import type { Role } from "./api";
import { hasMinRole } from "./auth";

export interface NavLinkType {
  href: string;
  label: string;
}

export function homePathForRole(role?: Role | null): string {
  if (hasMinRole(role, "MANAGER")) {
    return "/dashboard";
  }
  return "/my-inventory";
}

export function linksForRole(role: Role | null): NavLinkType[] {
  if (!role) {
    return [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Register" },
    ];
  }
  if (hasMinRole(role, "MANAGER")) {
    return [
      { href: "/my-inventory", label: "My inventory" },
      { href: "/inventory", label: "Inventory" },
      { href: "/users", label: "Users" },
      { href: "/teams", label: "Teams" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/profile", label: "Profile" },
    ];
  }
  return [
    { href: "/my-inventory", label: "My inventory" },
    { href: "/profile", label: "Profile" },
  ];
}
