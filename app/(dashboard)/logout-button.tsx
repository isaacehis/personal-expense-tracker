"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout request failed.");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label="Sign out of ExpenseTrack"
        className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 sm:text-sm"
      >
        {isLoggingOut ? "Signing out..." : "Sign out"}
      </button>

      {error ? (
        <p className="mt-2 max-w-48 text-xs text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
