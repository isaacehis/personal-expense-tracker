import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How ExpenseTrack collects, uses, secures, and retains account and financial data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 dark:border-slate-800"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6"><Logo /><ThemeToggle /></div></header>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500"><Link href="/" className="hover:text-emerald-600">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">Privacy</span></nav>
        <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-5xl">Privacy policy</h1>
        <p className="mt-4 text-slate-500">Last updated: 30 August 2026</p>
        <div className="mt-10 space-y-9 leading-7 text-slate-700 dark:text-slate-300">
          <PolicySection title="Data we collect">ExpenseTrack stores the name, email address, password hash, currency, timezone, categories, transactions, budgets, and hashed session identifiers needed to provide the service. It never stores a plain-text password, bank credential, or card number.</PolicySection>
          <PolicySection title="How data is used">Account information authenticates you and personalizes display. Financial records produce your dashboard, budget comparisons, and analytics. The application does not sell personal data.</PolicySection>
          <PolicySection title="Security and access">Data access is enforced on the server using authentication, per-user ownership conditions, database relationships, row-level policies, same-origin checks, secure cookies, and rate limiting. No internet service can promise absolute security, so deployments must also use HTTPS, managed backups, restricted credentials, and timely dependency updates.</PolicySection>
          <PolicySection title="Analytics">Google Analytics runs only when a deployment owner configures a measurement ID. IP anonymization is requested. Deployment owners should update this policy and configure any consent mechanism required by the laws that apply to their users.</PolicySection>
          <PolicySection title="Retention and deletion">Records remain until the account owner deletes them or the deployment administrator handles an account-deletion request. Expired and revoked sessions and old rate-limit records should be removed by scheduled maintenance.</PolicySection>
          <PolicySection title="Contact and scope">This repository is a final-year academic software project. Before a public launch, the deploying organization must add its real contact details, lawful basis, jurisdiction-specific disclosures, and data-request process.</PolicySection>
        </div>
        <Link href="/" className="mt-12 inline-flex rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400">Return home</Link>
      </main>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2><p className="mt-3">{children}</p></section>;
}
