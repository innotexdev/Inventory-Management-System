import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";

export function SiteNavContainer() {
  return (
    <Suspense
      fallback={
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
          >
            <Link
              href="/"
              className="flex items-center font-semibold text-zinc-950 dark:text-zinc-50"
            >
              <Image src="/logo-2.png" width={80} height={80} alt="site logo" loading="eager" />
              Inventory
            </Link>
          </nav>
        </header>
      }
    >
      <SiteNav />
    </Suspense>
  );
}