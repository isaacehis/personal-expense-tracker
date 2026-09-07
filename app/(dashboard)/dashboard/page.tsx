import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CategoryBars, MonthlyBars } from "@/components/analytics-charts";
import { getCurrentSession } from "@/lib/auth/session";
import { getFinancialOverview } from "@/lib/finance-data";

export const metadata: Metadata = { title: "Dashboard", description: "Your current income, expenses, balance, budgets, and recent activity." };

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const overview = await getFinancialOverview(session.user.id, session.user.timezone);
  const format = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: session.user.currency, maximumFractionDigits: 2 }).format(value);
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: session.user.timezone }).format(new Date());

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-600 sm:text-sm">Dashboard</p><h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-4xl">Welcome, {session.user.name}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">Your financial overview for {monthLabel}</p></div><Link href="/transactions?new=1" className="rounded-xl bg-emerald-500 px-5 py-3 text-center font-bold text-slate-950 hover:bg-emerald-400">+ Add transaction</Link></div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 xl:grid-cols-4"><SummaryCard label="Income" value={format(overview.income)} tone="text-emerald-600" /><SummaryCard label="Expenses" value={format(overview.expenses)} tone="text-rose-500" /><SummaryCard label="Balance" value={format(overview.balance)} tone={overview.balance >= 0 ? "text-sky-600" : "text-rose-500"} /><SummaryCard label="Budget alerts" value={String(overview.budgets.filter((budget) => budget.percentage > 100).length)} tone="text-amber-500" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><Panel title="Six-month tracking" link="/analytics"><MonthlyBars data={overview.sixMonthSeries} format={format} /></Panel><Panel title="Expenses by category" link="/analytics"><CategoryBars data={overview.categoryTotals.slice(0, 5)} format={format} /></Panel></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Budget progress" link="/budgets">{overview.budgets.length === 0 ? <Empty copy="No budgets for this month." href="/budgets" action="Create a budget" /> : <div className="space-y-5">{overview.budgets.slice(0, 4).map((budget) => <div key={budget.id}><div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{budget.category.name}</span><span className={budget.percentage > 100 ? "font-bold text-rose-500" : "text-slate-500 dark:text-slate-400"}>{format(budget.spent)} / {format(budget.amount)}</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${budget.percentage > 100 ? "bg-rose-500" : budget.percentage >= 80 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, budget.percentage)}%` }} /></div></div>)}</div>}</Panel>
        <Panel title="Recent transactions" link="/transactions">{overview.recentTransactions.length === 0 ? <Empty copy="No transactions yet." href="/transactions?new=1" action="Add the first one" /> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{overview.recentTransactions.map((item) => <article key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate font-semibold">{item.description}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400"><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.category.color }} />{item.category.name} · {new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", timeZone: "UTC" }).format(item.transactionDate)}</p></div><p className={`shrink-0 font-bold ${item.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>{item.type === "INCOME" ? "+" : "-"}{format(Number(item.amount))}</p></article>)}</div>}</Panel>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) { return <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-6"><p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">{label}</p><p className={`mt-2 break-words text-lg font-black sm:mt-3 sm:text-2xl ${tone}`}>{value}</p></article>; }
function Panel({ title, link, children }: { title: string; link: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl sm:p-7"><div className="mb-5 flex items-center justify-between gap-3 sm:mb-6"><h2 className="text-base font-bold sm:text-lg">{title}</h2><Link href={link} className="shrink-0 text-sm font-bold text-emerald-600 hover:text-emerald-500">View all</Link></div>{children}</section>; }
function Empty({ copy, href, action }: { copy: string; href: string; action: string }) { return <div className="rounded-2xl border border-dashed border-slate-300 p-7 text-center dark:border-slate-700"><p className="text-slate-500 dark:text-slate-400">{copy}</p><Link href={href} className="mt-3 inline-flex font-bold text-emerald-600">{action}</Link></div>; }
