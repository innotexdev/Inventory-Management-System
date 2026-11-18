"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { TeamView } from "@/lib/api";
import { createTeamAction, deleteTeamAction, updateTeamAction } from "@/lib/actions/admin";
import { teamSchema } from "@/lib/validation";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function TeamManagement({ teams }: { teams: TeamView[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = teamSchema.safeParse({ name, description });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please fix the highlighted fields.");
      return;
    }
    setPending(true);
    const result = await createTeamAction(parsed.data);
    setPending(false);
    setError(result.formError ?? null);
    setSuccess(result.success ?? null);
    if (result.success) {
      setName("");
      setDescription("");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-green-700">
          {success}
        </p>
      ) : null}
      <form
        onSubmit={createTeam}
        className="grid gap-4 rounded-xl border p-5 sm:grid-cols-[1fr_2fr_auto] sm:items-end"
      >
        <label className="flex flex-col gap-2 text-sm">
          Team name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 rounded-md border px-3"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Description
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-10 rounded-md border px-3"
          />
        </label>
        <button
          disabled={pending}
          className="h-10 rounded-full bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          Create team
        </button>
      </form>

      {teams.length === 0 ? (
        <p className="rounded-xl border p-6 text-sm text-zinc-600">No teams found.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {teams.map((team) => (
            <li key={team.id} className="rounded-xl border p-5">
              <TeamRow team={team} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TeamRow({ team }: { team: TeamView }) {
  const router = useRouter();
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    const parsed = teamSchema.safeParse({ name, description });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Invalid team");
      return;
    }
    setPending(true);
    const result = await updateTeamAction(team.id, parsed.data);
    setPending(false);
    setMessage(result.formError ?? result.success ?? null);
    router.refresh();
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
      <label className="flex flex-col gap-2 text-sm">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-10 rounded-md border px-3"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        Description
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="h-10 rounded-md border px-3"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="h-10 rounded-full border px-4 text-sm"
        >
          Save
        </button>
        <ConfirmDialog
          label="Delete"
          title="Delete this team?"
          description={
            team.memberCount > 0
              ? "Move every member to another team before deleting it."
              : "This team will be permanently removed."
          }
          confirmLabel="Delete team"
          disabled={team.memberCount > 0}
          destructive
          onConfirm={async () => {
            setPending(true);
            const result = await deleteTeamAction(team.id);
            setPending(false);
            setMessage(result.formError ?? result.success ?? null);
            router.refresh();
          }}
        />
      </div>
      {message ? (
        <p role="status" className="text-sm md:col-span-3">
          {message}
        </p>
      ) : null}
    </div>
  );
}
