import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex min-w-0 items-center gap-2.5 rounded-lg focus-ring sm:gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 sm:h-10 sm:w-10 sm:text-base">
        ET
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold tracking-tight sm:text-base">ExpenseTrack</span>
        <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
          Personal finance, clearly
        </span>
      </span>
    </Link>
  );
}
