"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { forgotPasswordSchema } from "@/lib/validation/auth";

type ResetRequestResponse = {
  message?: string;
  errors?: { email?: string[] };
};

const inputClasses =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const error = parsed.error.flatten().fieldErrors.email?.[0] ?? "Enter your email address.";
      setEmailError(error);
      setMessage(error);
      setIsError(true);
      return;
    }

    setEmailError("");
    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json().catch(() => ({}))) as ResetRequestResponse;

      if (!response.ok) {
        setEmailError(data.errors?.email?.[0] ?? "");
        setIsError(true);
        setMessage(data.message ?? "Unable to send the reset email.");
        return;
      }

      setMessage(data.message ?? "Check your email for a password-reset link.");
    } catch {
      setIsError(true);
      setMessage("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={255}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError("");
          }}
          disabled={isSubmitting}
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "forgot-email-error" : undefined}
          placeholder="you@example.com"
          className={inputClasses}
        />
        {emailError ? (
          <p id="forgot-email-error" className="mt-2 text-sm text-red-600 dark:text-red-300" role="alert">
            {emailError}
          </p>
        ) : null}
      </div>

      {message ? (
        <div
          role={isError ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            isError
              ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          }`}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending link..." : "Send reset link"}
      </button>

      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
