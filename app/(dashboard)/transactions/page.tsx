import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";

import { TransactionManager } from "./transaction-manager";

export const metadata: Metadata = {
  title: "Transactions",
  description: "Create, search, filter, edit, and delete your private income and expense records.",
};

export default async function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const params = await searchParams;
  return <TransactionManager currency={session.user.currency} initialOpen={params.new === "1"} />;
}
