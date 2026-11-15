import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

interface SiteHeaderProps {
  children?: ReactNode;
}

export function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <Link
          href="/"
          className="flex items-center justify-start font-semibold text-zinc-950 dark:text-zinc-50"
        >
          <Image
            src="/logo-2.png"
            width={80}
            height={80}
            alt=""
            loading="eager"
            className="h-8 w-auto"
          />
          Inventory
        </Link>

        {children}
      </nav>
    </header>
  );
}
