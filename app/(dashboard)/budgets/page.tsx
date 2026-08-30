import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import { getCurrentCalendarMonth } from "@/lib/finance";

import { BudgetManager } from "./budget-manager";

export const metadata: Metadata = {
  title: "Budgets",
  description: "Create monthly category budgets and compare limits with actual PostgreSQL expense totals.",
};

export default async function BudgetsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const current = getCurrentCalendarMonth(new Date(), session.user.timezone);
  return <BudgetManager currency={session.user.currency} initialYear={current.year} initialMonth={current.month} />;
}
