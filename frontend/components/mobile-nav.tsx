"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavLink } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";

interface MobileNavProps {
  links: NavLink[];
  isAuthenticated: boolean;
}

export function MobileNav({ links, isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const [previousPathname, setPreviousPathname] = useState(pathname);
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
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

      <div
        id="mobile-nav-menu"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-white px-6 pb-8 pt-4 transition-[opacity,transform,visibility] duration-300 ease-out will-change-[opacity,transform] motion-reduce:transition-none dark:bg-zinc-950 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${index * 40 + 100}ms` : "0ms" }}
              className={`border-b border-zinc-200 py-4 text-lg font-medium text-zinc-800 transition-[opacity,transform,color] duration-300 ease-out hover:text-zinc-500 motion-reduce:transition-none dark:border-zinc-800 dark:text-zinc-100 dark:hover:text-zinc-400 ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {isAuthenticated ? (
          <div className="mt-auto pt-6" onClick={() => setOpen(false)}>
            <LogoutButton />
          </div>
        ) : null}
      </div>
    </div>
  );
}
