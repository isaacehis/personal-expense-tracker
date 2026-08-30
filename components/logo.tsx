import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 rounded-lg focus-ring">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
        ET
      </span>
      <span>
        <span className="block font-bold tracking-tight">ExpenseTrack</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          Personal finance, clearly
        </span>
      </span>
    </Link>
  );
}
