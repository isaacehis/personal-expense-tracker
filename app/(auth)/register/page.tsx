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
      <div className="mb-8 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
            ET
          </div>
          <div>
            <p className="font-semibold">ExpenseTrack</p>
            <p className="text-sm text-slate-500">
              Personal finance management
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold text-indigo-600">
            Create your account
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Start tracking your finances
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter your information below. Your password will be securely
            hashed before it is stored.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}