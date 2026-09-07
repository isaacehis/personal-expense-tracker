"use client";

import { FormEvent, useDeferredValue, useEffect, useMemo, useState } from "react";

type TransactionType = "INCOME" | "EXPENSE";
type Category = { id: string; name: string; type: TransactionType; color: string; icon: string };
type Transaction = { id: string; type: TransactionType; amount: string; description: string; note: string | null; transactionDate: string; createdAt: string; category: Omit<Category, "type"> };
type Pagination = { page: number; pageSize: number; total: number; totalPages: number };
type FormData = { type: TransactionType; amount: string; description: string; note: string; categoryId: string; transactionDate: string };

const today = new Date().toISOString().slice(0, 10);
const emptyForm: FormData = { type: "EXPENSE", amount: "", description: "", note: "", categoryId: "", transactionDate: today };
const inputClass = "mt-2 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950";

export function TransactionManager({ currency, initialOpen }: { currency: string; initialOpen: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [month, setMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(initialOpen);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const format = useMemo(() => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }), [currency]);

  useEffect(() => {
    fetch("/api/categories", { credentials: "same-origin" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data.categories as Category[]; })
      .then(setCategories)
      .catch(() => setError("Unable to load transaction categories."));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (deferredSearch) params.set("search", deferredSearch);
    if (type) params.set("type", type);
    if (categoryId) params.set("categoryId", categoryId);
    if (month) params.set("month", month);
    if (!month && dateFrom) params.set("dateFrom", dateFrom);
    if (!month && dateTo) params.set("dateTo", dateTo);
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        setLoading(true);
        setError("");
      }
    });
    fetch(`/api/transactions?${params}`, { signal: controller.signal, credentials: "same-origin" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data as { transactions: Transaction[]; pagination: Pagination }; })
      .then((data) => { setTransactions(data.transactions); setPagination(data.pagination); })
      .catch((requestError) => { if (requestError instanceof Error && requestError.name !== "AbortError") setError(requestError.message || "Unable to load transactions."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [deferredSearch, type, categoryId, month, dateFrom, dateTo, page, success]);

  const visibleFilterCategories = categories.filter((category) => !type || category.type === type);
  const formCategories = categories.filter((category) => category.type === form.type);

  function openCreate(transactionType: TransactionType = "EXPENSE") {
    setEditingId(null);
    setForm({ ...emptyForm, type: transactionType });
    setFormOpen(true);
    setSuccess("");
    requestAnimationFrame(() => document.getElementById("transaction-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  function openEdit(transaction: Transaction) {
    setEditingId(transaction.id);
    setForm({ type: transaction.type, amount: transaction.amount, description: transaction.description, note: transaction.note ?? "", categoryId: transaction.category.id, transactionDate: transaction.transactionDate.slice(0, 10) });
    setFormOpen(true);
    setSuccess("");
    requestAnimationFrame(() => document.getElementById("transaction-form")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const response = await fetch(editingId ? `/api/transactions/${editingId}` : "/api/transactions", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Unable to save transaction.");
      setSuccess(data.message); setFormOpen(false); setEditingId(null); setForm(emptyForm); setPage(1);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Unable to save transaction."); }
    finally { setSubmitting(false); }
  }

  async function remove(transaction: Transaction) {
    if (!window.confirm(`Delete “${transaction.description}”? This cannot be undone.`)) return;
    setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: "{}" });
      const data = await response.json(); if (!response.ok) throw new Error(data.message); setSuccess(data.message);
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : "Unable to delete transaction."); }
  }

  function clearFilters() { setSearch(""); setType(""); setCategoryId(""); setMonth(""); setDateFrom(""); setDateTo(""); setPage(1); }

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[.25em] text-emerald-600">Transactions</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Transaction history</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Search, filter, and manage your income and expenses.</p></div><div className="flex gap-2"><button type="button" onClick={() => openCreate("INCOME")} className="rounded-xl border border-emerald-500 px-4 py-3 font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950">+ Income</button><button type="button" onClick={() => openCreate("EXPENSE")} className="rounded-xl bg-emerald-500 px-4 py-3 font-bold text-slate-950 hover:bg-emerald-400">+ Expense</button></div></div>

      {(error || success) && <div role={error ? "alert" : "status"} className={`mt-6 rounded-xl border px-4 py-3 text-sm ${error ? "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200" : "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"}`}>{error || success}</div>}

      {formOpen && <section id="transaction-form" aria-labelledby="transaction-form-title" className="mt-6 rounded-3xl border border-emerald-200 bg-white p-5 shadow-lg dark:border-emerald-900 dark:bg-slate-900 sm:p-7"><div className="flex items-center justify-between"><h2 id="transaction-form-title" className="text-xl font-black">{editingId ? "Edit transaction" : `Add ${form.type.toLowerCase()}`}</h2><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close transaction form">Close</button></div><form onSubmit={submit} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Type" htmlFor="transaction-type"><select id="transaction-type" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as TransactionType, categoryId: "" })} className={inputClass} disabled={submitting}><option value="EXPENSE">Expense</option><option value="INCOME">Income</option></select></Field>
        <Field label="Amount" htmlFor="amount"><input id="amount" type="number" min="0.01" max="999999999999.99" step="0.01" required inputMode="decimal" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className={inputClass} disabled={submitting} /></Field>
        <Field label="Date" htmlFor="transaction-date"><input id="transaction-date" type="date" required value={form.transactionDate} onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} className={inputClass} disabled={submitting} /></Field>
        <Field label="Category" htmlFor="transaction-category"><select id="transaction-category" required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className={inputClass} disabled={submitting}><option value="">Select category</option>{formCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>
        <Field label="Description" htmlFor="description"><input id="description" required maxLength={150} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} disabled={submitting} /></Field>
        <Field label="Note (optional)" htmlFor="note"><input id="note" maxLength={500} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className={inputClass} disabled={submitting} /></Field>
        <div className="sm:col-span-2 lg:col-span-3"><button type="submit" disabled={submitting} className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Save changes" : "Add transaction"}</button></div>
      </form></section>}

      <section aria-labelledby="filters-heading" className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5"><div className="flex items-center justify-between"><h2 id="filters-heading" className="font-bold">Filters</h2><button type="button" onClick={clearFilters} className="text-sm font-bold text-emerald-600">Clear all</button></div><div className="mt-4 grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6"><Field label="Search" htmlFor="search" className="col-span-2 lg:col-span-1"><input id="search" type="search" placeholder="Description or note" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className={inputClass} /></Field><Field label="Type" htmlFor="filter-type"><select id="filter-type" value={type} onChange={(event) => { setType(event.target.value); setCategoryId(""); setPage(1); }} className={inputClass}><option value="">All types</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></Field><Field label="Category" htmlFor="filter-category"><select id="filter-category" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} className={inputClass}><option value="">All categories</option>{visibleFilterCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Month" htmlFor="filter-month" className="col-span-2 lg:col-span-1"><input id="filter-month" type="month" value={month} onChange={(event) => { setMonth(event.target.value); setPage(1); }} className={inputClass} /></Field><Field label="From date" htmlFor="filter-from"><input id="filter-from" type="date" value={dateFrom} disabled={Boolean(month)} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className={inputClass} /></Field><Field label="To date" htmlFor="filter-to"><input id="filter-to" type="date" value={dateTo} disabled={Boolean(month)} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className={inputClass} /></Field></div></section>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? <div role="status" className="space-y-3 p-6"><span className="sr-only">Loading transactions</span>{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div> : transactions.length === 0 ? <div className="p-12 text-center"><p className="text-4xl" aria-hidden="true">↕</p><h2 className="mt-4 text-xl font-black">No transactions found</h2><p className="mt-2 text-slate-500 dark:text-slate-400">Adjust the filters or add a transaction.</p><button type="button" onClick={() => openCreate()} className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950">Add transaction</button></div> : <>
          <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">{transactions.map((transaction) => <article key={transaction.id} className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-bold">{transaction.description}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: transaction.category.color }} />{transaction.category.name}</p></div><p className={`shrink-0 font-black ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>{transaction.type === "INCOME" ? "+" : "-"}{format.format(Number(transaction.amount))}</p></div><div className="mt-4 flex items-center justify-between"><time className="text-sm text-slate-500">{formatDate(transaction.transactionDate)}</time><div className="flex gap-2"><button type="button" onClick={() => openEdit(transaction)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold dark:border-slate-700">Edit</button><button type="button" onClick={() => remove(transaction)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 dark:border-rose-900">Delete</button></div></div></article>)}</div>
          <div className="hidden overflow-x-auto md:block"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950"><tr><th className="px-5 py-4">Description</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Date</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{transactions.map((transaction) => <tr key={transaction.id}><td className="px-5 py-4"><p className="font-bold">{transaction.description}</p>{transaction.note && <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{transaction.note}</p>}</td><td className="px-5 py-4 text-sm"><i className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: transaction.category.color }} />{transaction.category.name}</td><td className="px-5 py-4 text-sm text-slate-500">{formatDate(transaction.transactionDate)}</td><td className={`px-5 py-4 text-right font-black ${transaction.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>{transaction.type === "INCOME" ? "+" : "-"}{format.format(Number(transaction.amount))}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => openEdit(transaction)} className="mr-3 text-sm font-bold text-emerald-600">Edit</button><button type="button" onClick={() => remove(transaction)} className="text-sm font-bold text-rose-600">Delete</button></td></tr>)}</tbody></table></div>
        </>}
      </div>
      {!loading && pagination.total > 0 && <nav aria-label="Transaction pages" className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><p className="text-center text-sm text-slate-500 sm:text-left">Page {pagination.page} of {pagination.totalPages} · {pagination.total} records</p><div className="grid grid-cols-2 gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-700">Previous</button><button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-40 dark:border-slate-700">Next</button></div></nav>}
    </section>
  );
}

function Field({ label, htmlFor, children, className = "" }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) { return <label htmlFor={htmlFor} className={`block min-w-0 text-sm font-semibold text-slate-700 dark:text-slate-200 ${className}`}>{label}{children}</label>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value)); }
