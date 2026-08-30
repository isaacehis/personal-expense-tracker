import { withUserContext } from "@/lib/database-context";
import {
  buildSixMonthSeries,
  calculateBudgetProgress,
  getCurrentCalendarMonth,
  getMonthRange,
} from "@/lib/finance";

export async function getFinancialOverview(
  userId: string,
  timezone: string,
  now = new Date(),
) {
  const current = getCurrentCalendarMonth(now, timezone);
  const currentRange = getMonthRange(current.year, current.month);
  const sixMonthStart = new Date(
    Date.UTC(current.year, current.month - 6, 1),
  );

  return withUserContext(userId, async (database) => {
    const [currentTransactions, recentTransactions, sixMonthTransactions, budgets] =
      await Promise.all([
        database.transaction.findMany({
          where: {
            userId,
            transactionDate: { gte: currentRange.start, lt: currentRange.end },
          },
          select: {
            type: true,
            amount: true,
            categoryId: true,
            category: { select: { name: true, color: true } },
          },
        }),
        database.transaction.findMany({
          where: { userId },
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            transactionDate: true,
            category: { select: { name: true, color: true } },
          },
          orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
          take: 5,
        }),
        database.transaction.findMany({
          where: {
            userId,
            transactionDate: { gte: sixMonthStart, lt: currentRange.end },
          },
          select: { type: true, amount: true, transactionDate: true },
        }),
        database.budget.findMany({
          where: { userId, year: current.year, month: current.month },
          select: {
            id: true,
            amount: true,
            categoryId: true,
            category: { select: { name: true, color: true } },
          },
          orderBy: { category: { name: "asc" } },
        }),
      ]);

    let income = 0;
    let expenses = 0;
    const categoryTotals = new Map<
      string,
      { categoryId: string; name: string; color: string; amount: number }
    >();

    for (const transaction of currentTransactions) {
      const amount = Number(transaction.amount);
      if (transaction.type === "INCOME") {
        income += amount;
      } else {
        expenses += amount;
        const existing = categoryTotals.get(transaction.categoryId);
        categoryTotals.set(transaction.categoryId, {
          categoryId: transaction.categoryId,
          name: transaction.category.name,
          color: transaction.category.color,
          amount: (existing?.amount ?? 0) + amount,
        });
      }
    }

    const spentByCategory = new Map(
      [...categoryTotals.values()].map((item) => [item.categoryId, item.amount]),
    );

    return {
      current,
      income,
      expenses,
      balance: income - expenses,
      recentTransactions,
      sixMonthSeries: buildSixMonthSeries(
        sixMonthTransactions.map((transaction) => ({
          ...transaction,
          amount: Number(transaction.amount),
        })),
        current.year,
        current.month,
      ),
      categoryTotals: [...categoryTotals.values()].sort(
        (a, b) => b.amount - a.amount,
      ),
      budgets: budgets.map((budget) => {
        const amount = Number(budget.amount);
        const spent = spentByCategory.get(budget.categoryId) ?? 0;
        return {
          ...budget,
          amount,
          spent,
          percentage: calculateBudgetProgress(spent, amount),
          remaining: amount - spent,
        };
      }),
    };
  });
}
