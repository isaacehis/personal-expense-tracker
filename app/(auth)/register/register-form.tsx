"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type FieldName = "name" | "email" | "password" | "confirmPassword";

type FieldErrors = Partial<Record<FieldName, string[]>>;

type RegisterResponse = {
  message?: string;
  errors?: FieldErrors;
};

const inputClasses =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p className="mt-2 text-sm text-red-600" role="alert">
      {messages[0]}
    </p>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const registrationData = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    setFieldErrors({});
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(registrationData),
      });

      const responseData = (await response
        .json()
        .catch(() => ({}))) as RegisterResponse;

      if (!response.ok) {
        setFieldErrors(responseData.errors ?? {});
        setFormError(
          responseData.message ??
            "Registration failed. Please check your information.",
        );
        return;
      }

      setSuccessMessage(
        responseData.message ??
          "Your account has been created successfully.",
      );

      form.reset();
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError(
        "Unable to connect to the server. Check that the development server is running.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {formError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {formError}
        </div>
      ) : null}
      {successMessage ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage} Opening your dashboard…</div> : null}

      <div>
        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Full name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          required
          minLength={2}
          maxLength={100}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.name)}
          className={inputClasses}
        />

        <FieldError messages={fieldErrors.name} />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          maxLength={255}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.email)}
          className={inputClasses}
        />

        <FieldError messages={fieldErrors.email} />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a secure password"
          required
          minLength={12}
          maxLength={128}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.password)}
          className={inputClasses}
        />

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Use at least 12 characters. Your password is never stored as plain
          text.
        </p>

        <FieldError messages={fieldErrors.password} />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Confirm password
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Enter the password again"
          required
          maxLength={128}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          className={inputClasses}
        />

        <FieldError messages={fieldErrors.confirmPassword} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
