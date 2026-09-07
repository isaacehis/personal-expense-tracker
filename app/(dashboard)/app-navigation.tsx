"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/dashboard", "Overview", "home"],
  ["/transactions", "Transactions", "add"],
  ["/budgets", "Budgets", "budget"],
  ["/analytics", "Analytics", "chart"],
  ["/settings", "Settings", "settings"],
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
    <nav aria-label="Mobile application navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-12px_35px_rgba(15,23,42,.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {links.map(([href, label, icon], index) => {
          const active = pathname === href;
          const isTransaction = index === 1;
          return <Link key={href} href={isTransaction ? "/transactions?new=1" : href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center rounded-2xl px-1 text-[10px] font-bold transition ${isTransaction ? "text-emerald-700 dark:text-emerald-300" : active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "text-slate-500 dark:text-slate-400"}`}><span className={isTransaction ? "-mt-5 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25" : "grid h-7 place-items-center"} aria-hidden="true"><NavIcon name={icon} /></span><span className={isTransaction ? "mt-1" : "mt-0.5"}>{isTransaction ? "Add" : label}</span></Link>;
        })}
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name: (typeof links)[number][2] }) {
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" /></>,
    add: <><path d="M12 5v14M5 12h14" /></>,
    budget: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M16 12h5M7 9h5M7 15h3" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></>,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
