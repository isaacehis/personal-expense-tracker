import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your secure personal expense tracker account.",
};

export default function RegisterPage() {
  return (
    <div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-600">
            Create your account
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Start tracking your finances
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Enter your information below. Your password will be securely
            hashed before it is stored.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-7 text-center text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Sign in
          </Link>
        </p>
      </div>
      <p className="mt-5 text-center text-sm"><Link href="/" className="text-slate-500 hover:text-emerald-600">← Back to home</Link></p>
    </div>
  );
}
