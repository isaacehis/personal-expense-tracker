import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentSession } from "@/lib/auth/session";

import { DesktopNavigation, MobileNavigation } from "./app-navigation";
import { Breadcrumbs } from "./breadcrumbs";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const firstName = session.user.name.trim().split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-emerald-400 focus:px-4 focus:py-2 focus:text-slate-950">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-5 sm:px-6 sm:py-4 lg:px-8">
          <Logo href="/dashboard" />
          <DesktopNavigation />
          <div className="flex items-center gap-2">
            <div className="hidden text-right xl:block"><p className="text-sm font-bold">{firstName}</p><p className="max-w-44 truncate text-xs text-slate-500 dark:text-slate-400">{session.user.email}</p></div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="dashboard-content" className="mx-auto max-w-7xl px-3 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-12"><Breadcrumbs />{children}</main>
      <MobileNavigation />
    </div>
  );
}
