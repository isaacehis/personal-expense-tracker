export type MoneyTransaction = {
  type: "INCOME" | "EXPENSE";
  amount: number;
  transactionDate: Date;
};

export type MonthPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateBalance(income: number, expenses: number) {
  return roundMoney(income - expenses);
}

export function calculateBudgetProgress(spent: number, budget: number) {
  if (budget <= 0) return 0;
  return Math.max(0, roundMoney((spent / budget) * 100));
}

export function getMonthRange(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function getCurrentCalendarMonth(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
  };
}

export function buildSixMonthSeries(
  transactions: MoneyTransaction[],
  endYear: number,
  endMonth: number,
): MonthPoint[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(endYear, endMonth - 1 - (5 - index), 1));
    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      income: 0,
      expense: 0,
    };
  });

  const byKey = new Map(months.map((month) => [month.key, month]));

  for (const transaction of transactions) {
    const key = `${transaction.transactionDate.getUTCFullYear()}-${String(
      transaction.transactionDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const month = byKey.get(key);
    if (!month) continue;

    if (transaction.type === "INCOME") {
      month.income = roundMoney(month.income + transaction.amount);
    } else {
      month.expense = roundMoney(month.expense + transaction.amount);
    }
  }

  return months;
}
