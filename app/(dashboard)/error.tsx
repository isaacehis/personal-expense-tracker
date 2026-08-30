"use client";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100"><p className="text-sm font-black uppercase tracking-wider text-rose-600 dark:text-rose-300">Something went wrong</p><h1 className="mt-3 text-3xl font-black">We could not load this page.</h1><p className="mt-3 text-rose-800 dark:text-rose-200">Your data was not changed. Check the database connection and try again.</p><button type="button" onClick={reset} className="mt-6 rounded-xl bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-500">Try again</button></section>;
}
