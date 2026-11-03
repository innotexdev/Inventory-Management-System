import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileDetailsForm } from "@/components/profile-details-form";
import { ChangePasswordForm } from "@/components/change-password-form";

export const instant = false;

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account details, your name and your password",
};

const ROLE_LABELS = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  ADMIN: "Admin",
} as const;

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "long" });

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  const accountDetails = [
    { label: "Email", value: user.email },
    { label: "Role", value: ROLE_LABELS[user.role] },
    { label: "Team", value: user.team?.name ?? "No team" },
    { label: "Member since", value: dateFormatter.format(new Date(user.createdAt)) },
  ];

  return (
    <main className="flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Profile
      </h1>

      <section
        aria-labelledby="account-heading"
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="account-heading" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Account
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Email, role and team are read-only.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {accountDetails.map((detail) => (
            <div key={detail.label} className="flex flex-col gap-1">
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">{detail.label}</dt>
              <dd className="break-words text-base font-medium text-zinc-950 dark:text-zinc-50">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="edit-details-heading"
          className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2
            id="edit-details-heading"
            className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
          >
            Edit details
          </h2>
          <p className="mt-1 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Update your first and last name.
          </p>
          <ProfileDetailsForm firstName={user.firstName} lastName={user.lastName} />
        </section>

        <section
          aria-labelledby="change-password-heading"
          className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h2
            id="change-password-heading"
            className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
          >
            Change password
          </h2>
          <p className="mt-1 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Choose a new password. It must be different from your current one.
          </p>
          <ChangePasswordForm />
        </section>
      </div>
    </main>
  );
}
