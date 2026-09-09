"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { loginSchema } from "@/lib/validation/auth";

type FormStatus = "idle" | "loading" | "success" | "error";

type LoginResponse = {
  message?: string;
  errors?: FieldErrors;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

type FieldErrors = Partial<Record<"email" | "password", string[]>>;

const inputClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:border-red-500 aria-[invalid=true]:focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950 dark:aria-[invalid=true]:focus:ring-red-950";

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p id={id} className="mt-2 text-sm text-red-600 dark:text-red-300" role="alert">
      {messages[0]}
    </p>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    const validationResult = loginSchema.safeParse({
      email: normalizedEmail,
      password,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFieldErrors(errors);
      setStatus("error");
      setMessage(
        errors.email?.[0] ??
          errors.password?.[0] ??
          "Please check your sign-in details.",
      );
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      setFieldErrors({});

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok) {
        setFieldErrors(data.errors ?? {});
        throw new Error(data.message ?? "Unable to sign in.");
      }

      setStatus("success");
      setMessage(
        `Welcome back${data.user?.name ? `, ${data.user.name}` : ""}. Your secure session is active.`,
      );

      setPassword("");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          disabled={status === "loading"}
          placeholder="student@example.com"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={255}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className={inputClasses}
        />
        <FieldError id="email-error" messages={fieldErrors.email} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Forgot password?
          </Link>
        </div>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, password: undefined }));
          }}
          disabled={status === "loading"}
          placeholder="Enter your password"
          required
          maxLength={128}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
          className={inputClasses}
        />
        <FieldError id="password-error" messages={fieldErrors.password} />
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm ${
            status === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
