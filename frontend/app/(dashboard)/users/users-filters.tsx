"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { TeamView } from "@/lib/api";
import {
  buildUsersHref,
  hasActiveConstraints,
  ROLES,
  ROLE_LABELS,
  type QueryChange,
  type UsersQuery,
} from "@/lib/users-query";

const controlClassName =
  "w-full rounded-md border border-zinc-500 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50";

const labelClassName = "text-sm font-medium text-zinc-950 dark:text-zinc-50";

export function UsersFilters({ query, teams }: { query: UsersQuery; teams: TeamView[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const currentParams = new URLSearchParams(params.toString());

  function apply(changes: QueryChange) {
    router.push(buildUsersHref(currentParams, changes), { scroll: false });
  }

  return (
    <section
      aria-labelledby="users-filters-heading"
      className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2
        id="users-filters-heading"
        className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
      >
        Filter users
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const search = String(form.get("search") ?? "").trim();
          apply({ search: search || undefined });
        }}
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="users-search" className={labelClassName}>
            Search
          </label>
          <input
            key={query.search ?? ""}
            id="users-search"
            name="search"
            type="search"
            maxLength={100}
            defaultValue={query.search ?? ""}
            placeholder="Name or email"
            className={controlClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="users-role" className={labelClassName}>
            Role
          </label>
          <select
            id="users-role"
            value={query.role ?? ""}
            onChange={(event) => apply({ role: event.target.value || undefined })}
            className={controlClassName}
          >
            <option value="">All roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="users-team" className={labelClassName}>
            Team
          </label>
          <select
            id="users-team"
            value={query.teamId ?? ""}
            onChange={(event) => apply({ teamId: event.target.value || undefined })}
            className={controlClassName}
          >
            <option value="">All teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="users-status" className={labelClassName}>
            Status
          </label>
          <select
            id="users-status"
            value={query.isActive === undefined ? "" : String(query.isActive)}
            onChange={(event) => apply({ isActive: event.target.value || undefined })}
            className={controlClassName}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
          >
            Search
          </button>
        </div>
      </form>

      {hasActiveConstraints(currentParams) ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Filters are applied.</p>
          <Link
            href="/users"
            className="rounded-sm text-sm font-medium text-zinc-950 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-50 dark:focus-visible:outline-zinc-50"
          >
            Clear filters
          </Link>
        </div>
      ) : null}
    </section>
  );
}
