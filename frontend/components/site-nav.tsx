import { getCurrentUser } from "@/lib/auth";
import { linksForRole } from "@/lib/navigation";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";
import { SiteHeader } from "./site-header";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

export async function SiteNav() {
  const user = await getCurrentUser().catch(() => null);
  const links = linksForRole(user?.role ?? null);

  return (
    <SiteHeader>
      <div className="hidden items-center gap-2 md:flex">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
            activeClassName="bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {link.label}
          </NavLink>
        ))}

        <ThemeToggle />
        {user ? <LogoutButton /> : null}
      </div>

      <MobileNav links={links} isAuthenticated={user != null} />
    </SiteHeader>
  );
}
