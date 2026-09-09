"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { resetPasswordSchema } from "@/lib/validation/auth";

type FieldErrors = Partial<Record<"token" | "newPassword" | "confirmPassword", string[]>>;

type ResetResponse = {
  message?: string;
  errors?: FieldErrors;
};

const inputClasses =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950";

function FieldError({ messages }: { messages?: string[] }) {
  return messages?.[0] ? <p className="mt-2 text-sm text-red-600 dark:text-red-300" role="alert">{messages[0]}</p> : null;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState(token ? "" : "The reset link is missing. Request a new one.");
  const [isError, setIsError] = useState(!token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const input = {
      token,
      newPassword: String(formData.get("newPassword") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };
    const parsed = resetPasswordSchema.safeParse(input);

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setMessage("Please correct the highlighted fields.");
      setIsError(true);
      return;
    }

    setFieldErrors({});
    setMessage("");
    setIsError(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json().catch(() => ({}))) as ResetResponse;

      if (!response.ok) {
        setFieldErrors(data.errors ?? {});
        setIsError(true);
        setMessage(data.message ?? "Unable to reset password.");
        return;
      }

      form.reset();
      setIsComplete(true);
      setMessage(data.message ?? "Password reset successfully.");
    } catch {
      setIsError(true);
      setMessage("Unable to connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="mt-8 space-y-5">
        <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {message}
        </div>
        <Link href="/login" className="block w-full rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950 hover:bg-emerald-300">
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div>
        <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-200">New password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={128}
          disabled={isSubmitting || !token}
          aria-invalid={Boolean(fieldErrors.newPassword)}
          placeholder="At least 12 characters"
          className={inputClasses}
        />
        <FieldError messages={fieldErrors.newPassword} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirm new password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          maxLength={128}
          disabled={isSubmitting || !token}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          placeholder="Enter the password again"
          className={inputClasses}
        />
        <FieldError messages={fieldErrors.confirmPassword} />
      </div>

      {message ? (
        <div role={isError ? "alert" : "status"} className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !token}
        className="w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Resetting password..." : "Reset password"}
      </button>

      <p className="text-center text-sm">
        <Link href="/forgot-password" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
          Request a new link
        </Link>
      </p>
    </form>
  );
}
