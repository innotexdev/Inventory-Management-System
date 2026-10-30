import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { linksForRole } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";
import { SiteHeader } from "./site-header";

export async function SiteNav() {
  const user = await getCurrentUser();
  const links = linksForRole(user?.role ?? null);

  return (
    <SiteHeader>
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
    </SiteHeader>
  );
}
