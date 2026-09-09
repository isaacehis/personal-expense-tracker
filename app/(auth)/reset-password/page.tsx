import type { Metadata } from "next";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new ExpenseTrack password.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
        Secure recovery
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Use at least 12 characters. Completing this reset signs out other active sessions.
      </p>
      <ResetPasswordForm token={token} />
    </section>
  );
}
