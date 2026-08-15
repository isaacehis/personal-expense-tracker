import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const now = new Date();

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const nextMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );

  const monthFilter = {
    gte: monthStart,
    lt: nextMonthStart,
  };

  const [incomeSummary, expenseSummary, recentTransactions] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "INCOME",
          transactionDate: monthFilter,
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          type: "EXPENSE",
          transactionDate: monthFilter,
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          transactionDate: monthFilter,
        },
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          transactionDate: true,
          category: {
            select: {
              name: true,
              color: true,
            },
          },
        },
        orderBy: [
          {
            transactionDate: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
        take: 5,
      }),
    ]);

  const totalIncome = Number(incomeSummary._sum.amount ?? 0);
  const totalExpenses = Number(expenseSummary._sum.amount ?? 0);
  const balance = totalIncome - totalExpenses;

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: session.user.currency,
    minimumFractionDigits: 2,
  });

  const monthLabel = new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
    timeZone: session.user.timezone,
  }).format(now);

  return (
    <section>
      <p className="font-semibold uppercase tracking-[0.3em] text-emerald-400">
        Dashboard
      </p>

      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Welcome, {session.user.name}
      </h1>

      <p className="mt-4 text-lg text-slate-400">
        Your financial overview for {monthLabel}
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <SummaryCard
          label="Total income"
          amount={currencyFormatter.format(totalIncome)}
          colour="text-emerald-400"
        />

        <SummaryCard
          label="Total expenses"
          amount={currencyFormatter.format(totalExpenses)}
          colour="text-red-400"
        />

        <SummaryCard
          label="Balance"
          amount={currencyFormatter.format(balance)}
          colour={balance >= 0 ? "text-emerald-400" : "text-red-400"}
        />
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Recent transactions
        </p>

        {recentTransactions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <h2 className="text-2xl font-bold">No transactions this month</h2>

            <p className="mt-3 text-slate-400">
              Your income and expense records will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {recentTransactions.map((transaction) => {
              const amount = Number(transaction.amount);
              const isIncome = transaction.type === "INCOME";

              return (
                <article
                  key={transaction.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: transaction.category.color,
                      }}
                    />

                    <div>
                      <h2 className="font-semibold">
                        {transaction.description}
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        {transaction.category.name} ·{" "}
                        {new Intl.DateTimeFormat("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(transaction.transactionDate)}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-lg font-bold ${
                      isIncome ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {currencyFormatter.format(amount)}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  amount: string;
  colour: string;
};

function SummaryCard({ label, amount, colour }: SummaryCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className={`mt-4 text-3xl font-bold ${colour}`}>{amount}</p>
    </article>
  );
}