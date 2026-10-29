import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { linksForRole } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";

export async function SiteNav() {
  const user = await getCurrentUser();
  const links = linksForRole(user?.role ?? null);

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
            alt="site logo"
            loading="eager"
            className="h-8 w-auto"
          />
          Inventory
        </Link>
        <div className="flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          {user ? <LogoutButton /> : null}
        </div>
      </nav>
    </header>
  );
}
