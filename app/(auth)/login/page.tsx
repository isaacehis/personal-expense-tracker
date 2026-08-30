import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to manage your personal finances.",
};

export default function LoginPage() {
  return (
    <section className="w-full max-w-xl rounded-[2rem] border border-white/30 bg-black/40 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
        Welcome back
      </p>

      <h1 className="mt-3 text-4xl font-bold text-white">
        Sign in to your account
      </h1>

      <p className="mt-4 text-slate-300">
        Enter your email address and password to continue.
      </p>

      <LoginForm />

      <p className="mt-8 text-center text-sm text-slate-300">
        Do not have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Create one
        </Link>
      </p>
      <p className="mt-4 text-center text-sm"><Link href="/" className="text-slate-400 hover:text-emerald-400">← Back to home</Link></p>
    </section>
  );
}
