import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homePathForRole, isSafeNextPath } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your inventory account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(homePathForRole(user.role));
  }
  const { next } = await searchParams;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Log in
      </h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        No account yet?{" "}
        <Link href="/register" className="font-medium underline">
          Register
        </Link>
      </p>
      <LoginForm next={isSafeNextPath(next) ? next : "/"} />
    </>
  );
}
