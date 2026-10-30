import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/register-form";
import { homePathForRole } from "@/lib/navigation";

export const instant = false;

export const metadata: Metadata = {
  title: "Register",
  description: "Create an inventory account",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(homePathForRole(user.role));
  }

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Register
      </h1>
      <p className="mt-1 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Log in
        </Link>
      </p>
      <RegisterForm />
    </>
  );
}
