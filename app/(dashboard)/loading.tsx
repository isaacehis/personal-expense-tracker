export default function DashboardLoading() {
  return <div role="status" aria-live="polite" className="animate-pulse"><span className="sr-only">Loading page</span><div className="h-9 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" /><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-3xl bg-slate-200 dark:bg-slate-800" />)}</div><div className="mt-6 h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" /></div>;
}
