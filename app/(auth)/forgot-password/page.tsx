import type { Metadata } from "next";

import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a secure ExpenseTrack password-reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
        Account recovery
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Enter the email address used to create your account. The secure link expires after 30 minutes.
      </p>
      <ForgotPasswordForm />
    </section>
  );
}
