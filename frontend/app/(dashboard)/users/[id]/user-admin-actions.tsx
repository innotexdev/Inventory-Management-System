"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role, TeamView, UserView } from "@/lib/api";
import { updateUserAdminAction } from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function UserAdminActions({ user, teams }: { user: UserView; teams: TeamView[] }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(user.role);
  const [teamId, setTeamId] = useState(user.teamId ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    const result = await updateUserAdminAction(user.id, {
      role,
      teamId: teamId === "" ? null : teamId,
    });
    setPending(false);
    setMessage(result.formError ?? result.success ?? null);
    router.refresh();
  }

  return (
    <section
      aria-labelledby="admin-actions-heading"
      className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 id="admin-actions-heading" className="text-lg font-semibold">
        Administration
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="h-10 rounded-md border px-3"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Team
          <select
            value={teamId}
            onChange={(event) => setTeamId(event.target.value)}
            className="h-10 rounded-md border px-3"
          >
            <option value="">No team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="h-10 rounded-full bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          Save changes
        </button>
        {user.isActive ? (
          <ConfirmDialog
            label="Deactivate"
            title="Deactivate this user?"
            description="The user cannot log in after deactivation."
            confirmLabel="Deactivate user"
            destructive
            onConfirm={async () => {
              setPending(true);
              const result = await updateUserAdminAction(user.id, { isActive: false });
              setPending(false);
              setMessage(result.formError ?? result.success ?? null);
              router.refresh();
            }}
          />
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const result = await updateUserAdminAction(user.id, { isActive: true });
              setPending(false);
              setMessage(result.formError ?? result.success ?? null);
              router.refresh();
            }}
            className="h-10 rounded-full border px-4 text-sm"
          >
            Reactivate
          </button>
        )}
      </div>
      {message ? (
        <p role="status" className="mt-3 text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
