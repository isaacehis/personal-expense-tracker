"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Category = { id: string; name: string; type: "INCOME" | "EXPENSE"; color: string };
type Budget = { id: string; amount: string; spent: string; remaining: string; percentage: number; overspent: boolean; month: number; year: number; category: { id: string; name: string; color: string } };
const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950";

export function BudgetManager({ currency, initialYear, initialMonth }: { currency: string; initialYear: number; initialMonth: number }) {
  const [selectedMonth, setSelectedMonth] = useState(`${initialYear}-${String(initialMonth).padStart(2, "0")}`);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const format = useMemo(() => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }), [currency]);
  const [year, month] = selectedMonth.split("-").map(Number);

  useEffect(() => {
    fetch("/api/categories", { credentials: "same-origin" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.categories as Category[]; })
      .then((items) => setCategories(items.filter((item) => item.type === "EXPENSE")))
      .catch(() => setError("Unable to load expense categories."));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoading(true);
        setError("");
      }
    });
    fetch(`/api/budgets?year=${year}&month=${month}`, { signal: controller.signal, credentials: "same-origin" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.budgets as Budget[]; })
      .then(setBudgets)
      .catch((requestError) => { if (requestError instanceof Error && requestError.name !== "AbortError") setError(requestError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [year, month, message]);

  function openCreate() { setEditingId(null); setCategoryId(""); setAmount(""); setFormOpen(true); setMessage(""); }
  function openEdit(budget: Budget) { setEditingId(budget.id); setCategoryId(budget.category.id); setAmount(budget.amount); setFormOpen(true); setMessage(""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(""); setMessage("");
    try {
      const response = await fetch(editingId ? `/api/budgets/${editingId}` : "/api/budgets", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ categoryId, amount, year, month }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message); setMessage(data.message); setFormOpen(false);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to save budget."); }
    finally { setSubmitting(false); }
  }

  async function remove(budget: Budget) {
    if (!window.confirm(`Delete the ${budget.category.name} budget?`)) return;
    setError(""); setMessage("");
    try { const response = await fetch(`/api/budgets/${budget.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: "{}" }); const data = await response.json(); if (!response.ok) throw new Error(data.message); setMessage(data.message); }
    catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Unable to delete budget."); }
  }

  const totalBudget = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.spent), 0);

  return <section>
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[.25em] text-emerald-600">Budgets</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Monthly spending plan</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Compare category limits with actual expense transactions.</p></div><button type="button" onClick={openCreate} className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400">+ Create budget</button></div>
    {(message || error) && <div role={error ? "alert" : "status"} className={`mt-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200" : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"}`}>{error || message}</div>}
    <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between"><label htmlFor="budget-month" className="text-sm font-bold">Budget month<input id="budget-month" type="month" value={selectedMonth} min="2000-01" max="9999-12" onChange={(event) => { setSelectedMonth(event.target.value); setMessage(""); }} className={`${inputClass} sm:w-56`} /></label><div className="grid grid-cols-2 gap-5 text-right"><div><p className="text-xs font-bold uppercase text-slate-500">Planned</p><p className="mt-1 text-xl font-black">{format.format(totalBudget)}</p></div><div><p className="text-xs font-bold uppercase text-slate-500">Spent</p><p className={`mt-1 text-xl font-black ${totalSpent > totalBudget && totalBudget > 0 ? "text-rose-500" : "text-emerald-600"}`}>{format.format(totalSpent)}</p></div></div></div>
    {formOpen && <section aria-labelledby="budget-form-title" className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 dark:border-emerald-900 dark:bg-slate-900 sm:p-7"><div className="flex justify-between"><h2 id="budget-form-title" className="text-xl font-black">{editingId ? "Edit budget" : "Create budget"}</h2><button type="button" onClick={() => setFormOpen(false)} className="text-sm font-bold text-slate-500">Close</button></div><form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label htmlFor="budget-category" className="text-sm font-bold">Expense category<select id="budget-category" required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label htmlFor="budget-amount" className="text-sm font-bold">Monthly limit<input id="budget-amount" type="number" required min="0.01" max="999999999999.99" step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} /></label><button type="submit" disabled={submitting} className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-60">{submitting ? "Saving..." : "Save budget"}</button></form></section>}
    <div className="mt-6">{loading ? <div role="status" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><span className="sr-only">Loading budgets</span>{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-56 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />)}</div> : budgets.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><p className="text-4xl" aria-hidden="true">◎</p><h2 className="mt-4 text-xl font-black">No budgets for this month</h2><p className="mt-2 text-slate-500">Create a limit for an expense category to begin tracking.</p><button type="button" onClick={openCreate} className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950">Create budget</button></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{budgets.map((budget) => <article key={budget.id} className={`rounded-3xl border bg-white p-6 dark:bg-slate-900 ${budget.overspent ? "border-rose-300 dark:border-rose-900" : "border-slate-200 dark:border-slate-800"}`}><div className="flex items-start justify-between gap-3"><div><span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: budget.category.color }} /><h2 className="mt-3 text-xl font-black">{budget.category.name}</h2></div>{budget.overspent && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">Overspent</span>}</div><p className="mt-6 text-2xl font-black">{format.format(Number(budget.spent))} <span className="text-sm font-semibold text-slate-500">of {format.format(Number(budget.amount))}</span></p><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${budget.overspent ? "bg-rose-500" : budget.percentage >= 80 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, budget.percentage)}%` }} /></div><div className="mt-3 flex justify-between text-sm"><span className={budget.overspent ? "font-bold text-rose-500" : "text-slate-500"}>{budget.overspent ? `${format.format(Math.abs(Number(budget.remaining)))} over` : `${format.format(Number(budget.remaining))} left`}</span><span className="font-bold">{budget.percentage.toFixed(1)}%</span></div><div className="mt-6 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><button type="button" onClick={() => openEdit(budget)} className="text-sm font-bold text-emerald-600">Edit</button><button type="button" onClick={() => remove(budget)} className="text-sm font-bold text-rose-600">Delete</button></div></article>)}</div>}</div>
  </section>;
}
