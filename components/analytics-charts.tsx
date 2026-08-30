import type { MonthPoint } from "@/lib/finance";

export function MonthlyBars({ data, format }: { data: MonthPoint[]; format: (value: number) => string }) {
  const maximum = Math.max(1, ...data.flatMap((point) => [point.income, point.expense]));
  return (
    <div role="img" aria-label={`Six-month income and expense chart. ${data.map((point) => `${point.label}: income ${format(point.income)}, expenses ${format(point.expense)}`).join("; ")}`}>
      <div className="flex h-64 items-end gap-3 border-b border-slate-200 pt-8 dark:border-slate-700 sm:gap-5">
        {data.map((point) => <div key={point.key} className="flex h-full flex-1 flex-col justify-end"><div className="flex flex-1 items-end justify-center gap-1 sm:gap-2"><span className="w-1/2 rounded-t-md bg-emerald-500" style={{ height: `${Math.max(2, (point.income / maximum) * 100)}%` }} title={`${point.label} income: ${format(point.income)}`} /><span className="w-1/2 rounded-t-md bg-rose-500" style={{ height: `${Math.max(2, (point.expense / maximum) * 100)}%` }} title={`${point.label} expenses: ${format(point.expense)}`} /></div><span className="pt-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{point.label}</span></div>)}
      </div>
      <div className="mt-4 flex gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400"><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />Income</span><span><i className="mr-2 inline-block h-2.5 w-2.5 rounded-sm bg-rose-500" />Expenses</span></div>
    </div>
  );
}

export function CategoryBars({ data, format }: { data: { name: string; color: string; amount: number }[]; format: (value: number) => string }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  if (data.length === 0) return <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No expense data for this month.</p>;
  return <div className="space-y-5">{data.map((item) => { const percentage = total ? (item.amount / total) * 100 : 0; return <div key={item.name}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 font-semibold"><i className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><span className="text-slate-500 dark:text-slate-400">{format(item.amount)} · {percentage.toFixed(1)}%</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} /></div></div>; })}</div>;
}
