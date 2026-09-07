import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your personal finances.",
};

export default function LoginPage() {
  return (
    <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
        Welcome back
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Sign in to your account
      </h1>

      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Enter your email address and password to continue.
      </p>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-300">
        Do not have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
        >
          Create one
        </Link>
      </p>
      <p className="mt-4 text-center text-sm"><Link href="/" className="text-slate-400 hover:text-emerald-400">← Back to home</Link></p>
    </section>
  );
}
