import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

import LogoutButton from "./logout-button";

type DashboardLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const firstName = session.user.name.trim().split(/\s+/)[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-lg font-bold text-emerald-400">ExpenseTrack</p>
            <p className="text-sm text-slate-400">
              Personal finance management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="font-medium">Hello, {firstName}</p>
              <p className="text-sm text-slate-400">{session.user.email}</p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}