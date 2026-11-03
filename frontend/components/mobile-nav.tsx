"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavLink } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";

interface MobileNavProps {
  links: NavLink[];
  isAuthenticated: boolean;
}

export function MobileNav({ links, isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the menu whenever the route changes by adjusting state during render.
  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  // Close on Escape or on a click/tap outside the menu.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full p-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        {open ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open ? (
        <div
          id="mobile-nav-menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <div
              className="mt-1 border-t border-zinc-200 px-4 pt-2 dark:border-zinc-800"
              onClick={() => setOpen(false)}
            >
              <LogoutButton />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
