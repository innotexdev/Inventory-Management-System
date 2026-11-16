"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

export function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  activeClassName?: string;
}

export function NavLink({ href, className = "", activeClassName = "", ...props }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${className} ${active ? activeClassName : ""}`}
      {...props}
    />
  );
}
