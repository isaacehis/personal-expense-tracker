import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthLayoutProps = {
  children: ReactNode;
};

const features = [
  "Secure password storage and authentication sessions",
  "Private financial records for each registered user",
  "Income, expense, budget, and monthly tracking",
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white lg:grid lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-20"><ThemeToggle /></div>
      <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
            Take control of your money
          </p>

          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Understand where your money goes every month.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Record your income and expenses, create budgets, and make better
            financial decisions from one secure application.
          </p>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-xs font-bold text-slate-950">
                  ✓
                </span>
                <span className="text-slate-200">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-500">
          Final-year Computer Science project
        </p>
      </aside>

      <section className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-7 lg:hidden"><Logo /></div>
          {children}
        </div>
      </section>
    </main>
  );
}
