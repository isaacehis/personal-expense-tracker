"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/dashboard", "Overview", "⌂"],
  ["/transactions", "Transactions", "↕"],
  ["/budgets", "Budgets", "◎"],
  ["/analytics", "Analytics", "▥"],
  ["/settings", "Settings", "⚙"],
] as const;

export function DesktopNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Application navigation" className="hidden items-center gap-1 lg:flex">
      {links.map(([href, label]) => {
        const active = pathname === href;
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>{label}</Link>;
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mobile application navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {links.map(([href, label, icon], index) => {
          const active = pathname === href;
          const isTransaction = index === 1;
          return <Link key={href} href={isTransaction ? "/transactions?new=1" : href} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center rounded-xl px-1 text-[10px] font-bold ${isTransaction ? "bg-emerald-500 text-slate-950" : active ? "text-emerald-600" : "text-slate-500 dark:text-slate-400"}`}><span className="text-lg leading-none" aria-hidden="true">{isTransaction ? "+" : icon}</span><span className="mt-1">{isTransaction ? "Add" : label}</span></Link>;
        })}
      </div>
    </nav>
  );
}
