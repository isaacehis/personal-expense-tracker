"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transactions",
  budgets: "Budgets",
  analytics: "Analytics",
  settings: "Settings",
};

export function Breadcrumbs() {
  const segment = usePathname().split("/").filter(Boolean)[0] ?? "dashboard";
  const label = labels[segment] ?? "Page";
  return <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500 dark:text-slate-400"><Link href="/dashboard" className="hover:text-emerald-600">ExpenseTrack</Link><span aria-hidden="true"> / </span><span aria-current="page">{label}</span></nav>;
}
