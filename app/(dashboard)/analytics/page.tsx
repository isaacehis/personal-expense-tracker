import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryBars, MonthlyBars } from "@/components/analytics-charts";
import { getCurrentSession } from "@/lib/auth/session";
import { getFinancialOverview } from "@/lib/finance-data";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Analyze six months of real income, expenses, category spending, and monthly budget progress.",
};

export default async function AnalyticsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const overview = await getFinancialOverview(session.user.id, session.user.timezone);
  const format = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: session.user.currency, maximumFractionDigits: 2 }).format(value);
  const savingsRate = overview.income > 0 ? (overview.balance / overview.income) * 100 : 0;

  return <section>
    <div><p className="text-sm font-black uppercase tracking-[.25em] text-emerald-600">Analytics</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Financial trends</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Every chart below is calculated from your database records.</p></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="This month's income" value={format(overview.income)} tone="text-emerald-600" /><Metric label="This month's expenses" value={format(overview.expenses)} tone="text-rose-500" /><Metric label="Net balance" value={format(overview.balance)} tone={overview.balance >= 0 ? "text-sky-600" : "text-rose-500"} /><Metric label="Savings rate" value={`${savingsRate.toFixed(1)}%`} tone={savingsRate >= 0 ? "text-emerald-600" : "text-rose-500"} /></div>
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7"><div className="mb-7"><h2 className="text-xl font-black">Income versus expenses</h2><p className="mt-1 text-sm text-slate-500">Six calendar months ending this month</p></div><MonthlyBars data={overview.sixMonthSeries} format={format} /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2"><section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7"><h2 className="text-xl font-black">Expense breakdown</h2><p className="mt-1 text-sm text-slate-500">Current month by category</p><div className="mt-7"><CategoryBars data={overview.categoryTotals} format={format} /></div></section><section className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Budget health</h2><p className="mt-1 text-sm text-slate-500">Current category limits</p></div><Link href="/budgets" className="text-sm font-bold text-emerald-600">Manage</Link></div><div className="mt-7">{overview.budgets.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">Create budgets to see progress here.</p> : <div className="space-y-5">{overview.budgets.map((budget) => <div key={budget.id}><div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{budget.category.name}</span><span className={budget.percentage > 100 ? "font-bold text-rose-500" : "text-slate-500"}>{budget.percentage.toFixed(1)}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${budget.percentage > 100 ? "bg-rose-500" : budget.percentage >= 80 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, budget.percentage)}%` }} /></div><p className="mt-1 text-xs text-slate-500">{format(budget.spent)} spent of {format(budget.amount)}</p></div>)}</div>}</div></section></div>
  </section>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone: string }) { return <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-3 break-words text-2xl font-black ${tone}`}>{value}</p></article>; }
