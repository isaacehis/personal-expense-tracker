import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Secure personal finance tracking",
  description:
    "Track income, expenses, category budgets, and monthly trends in a secure multi-user personal finance application.",
  alternates: { canonical: "/" },
};

const features = [
  ["Fast transaction tracking", "Record income and expenses, then search and filter the complete history."],
  ["Monthly budgets", "Set spending limits by expense category and see warnings before habits become problems."],
  ["Useful analytics", "Compare six months of income and spending using only your real financial records."],
  ["Private by design", "Server-side authorization keeps every account's financial records separate."],
];

const faqs = [
  ["Is my financial data shared with other users?", "No. Every protected database operation includes your user ID and the database also has row-level policies for defence in depth."],
  ["Does ExpenseTrack connect to my bank?", "No. You enter transactions yourself, so the application never needs your bank password or card details."],
  ["Can I use a different currency or timezone?", "Yes. Choose your preferred currency and IANA timezone in Settings; dashboard values and dates update for your account."],
  ["What happens after I change my password?", "Your current session stays active and every other active session is revoked automatically."],
];

export default function HomePage() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-emerald-400 focus:px-4 focus:py-2 focus:text-slate-950">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <nav aria-label="Main navigation" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#features" className="hover:text-emerald-600">Features</a>
            <a href="#security" className="hover:text-emerald-600">Security</a>
            <a href="#faq" className="hover:text-emerald-600">FAQs</a>
            <Link href="/privacy" className="hover:text-emerald-600">Privacy</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm font-semibold hover:text-emerald-600 sm:block">Sign in</Link>
            <Link href="/register" className="rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">Get started</Link>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,.15),transparent_35%),radial-gradient(circle_at_10%_80%,rgba(59,130,246,.12),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-32">
            <div>
              <p className="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Secure, clear, and built for everyday money</p>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Know where your money goes. <span className="text-emerald-500">Plan what comes next.</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">Record income and expenses, set monthly category budgets, and understand six-month trends from one responsive dashboard.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="rounded-xl bg-emerald-500 px-6 py-3.5 text-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400">Create a free account</Link>
                <a href="#how-it-works" className="rounded-xl border border-slate-300 px-6 py-3.5 text-center font-bold transition hover:border-emerald-400 dark:border-slate-700">See how it works</a>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No bank connection required. Your records stay private to your account.</p>
            </div>

            <div aria-label="Example of the finance summary interface" className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:p-7">
              <div className="flex items-center justify-between"><p className="font-bold">Monthly overview</p><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Live totals</span></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <PreviewCard label="Income" value="₦420k" className="text-emerald-600" />
                <PreviewCard label="Expenses" value="₦268k" className="text-rose-500" />
                <PreviewCard label="Balance" value="₦152k" className="text-sky-600" />
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-end justify-between gap-2" aria-hidden="true">
                  {[38, 62, 44, 77, 55, 88].map((height, index) => <span key={height} className="w-full rounded-t-lg bg-emerald-400/90" style={{ height: `${height * 1.4}px` }} title={`Month ${index + 1}`} />)}
                </div>
                <div className="mt-3 flex justify-between text-xs text-slate-400"><span>6 months ago</span><span>This month</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[.25em] text-emerald-600">Everything essential</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">A focused toolkit for better financial habits</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {features.map(([title, copy], index) => <article key={title} className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800 dark:bg-slate-900/50"><span className="text-sm font-black text-emerald-600">0{index + 1}</span><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{copy}</p></article>)}
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-50 py-20 dark:bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">From entry to insight in three steps</h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[['Record', 'Add income and expenses with a date and category.'], ['Plan', 'Set a monthly limit for each expense category.'], ['Review', 'Use dashboard and analytics views to understand the result.']].map(([title, copy], i) => <li key={title} className="rounded-3xl bg-white p-7 shadow-sm dark:bg-slate-950"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 font-black text-slate-950">{i + 1}</span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-slate-600 dark:text-slate-300">{copy}</p></li>)}
            </ol>
          </div>
        </section>

        <section id="security" className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div><p className="text-sm font-bold uppercase tracking-[.25em] text-emerald-600">Security is structural</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your browser never receives database credentials or secrets.</h2><p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">Passwords use Argon2id hashing, session tokens are stored as one-way hashes, cookies are HttpOnly, and every resource operation is authorized on the server.</p></div>
          <ul className="grid gap-3 text-sm sm:grid-cols-2">{['Same-origin mutation checks','Database-backed rate limits','Secure production cookies','Per-user ownership checks','Validated JSON inputs','Security response headers'].map((item) => <li key={item} className="rounded-2xl border border-slate-200 p-4 font-semibold dark:border-slate-800"><span className="mr-2 text-emerald-500" aria-hidden="true">✓</span>{item}</li>)}</ul>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-black tracking-tight sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-6 font-bold marker:hidden">{question}<span className="float-right text-emerald-500 group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-300">{answer}</p></details>)}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"><div className="rounded-[2rem] bg-emerald-500 px-6 py-12 text-center text-slate-950 sm:px-12"><h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready for a clearer view of your finances?</h2><p className="mx-auto mt-4 max-w-2xl text-emerald-950">Create your private account and record your first transaction in minutes.</p><Link href="/register" className="mt-7 inline-flex rounded-xl bg-slate-950 px-6 py-3.5 font-bold text-white hover:bg-slate-800">Start tracking</Link></div></section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© {year} ExpenseTrack. Academic project with transparent assisted development.</p><div className="flex gap-5"><Link href="/privacy" className="hover:text-emerald-600">Privacy</Link><Link href="/login" className="hover:text-emerald-600">Sign in</Link><Link href="/register" className="hover:text-emerald-600">Register</Link></div></div></footer>
    </div>
  );
}

function PreviewCard({ label, value, className }: { label: string; value: string; className: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p><p className={`mt-2 text-xl font-black ${className}`}>{value}</p></div>;
}
