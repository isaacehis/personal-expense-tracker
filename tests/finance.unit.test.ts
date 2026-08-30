import assert from "node:assert/strict";
import test from "node:test";

import { buildSixMonthSeries, calculateBalance, calculateBudgetProgress, getMonthRange, roundMoney } from "../lib/finance";

test("financial values are rounded to currency precision", () => {
  assert.equal(roundMoney(10.005), 10.01);
  assert.equal(calculateBalance(1250.25, 700.1), 550.15);
});

test("budget progress handles normal, overspent, and zero values", () => {
  assert.equal(calculateBudgetProgress(250, 1000), 25);
  assert.equal(calculateBudgetProgress(1200, 1000), 120);
  assert.equal(calculateBudgetProgress(50, 0), 0);
});

test("month ranges use an exclusive next-month boundary", () => {
  const range = getMonthRange(2024, 2);
  assert.equal(range.start.toISOString(), "2024-02-01T00:00:00.000Z");
  assert.equal(range.end.toISOString(), "2024-03-01T00:00:00.000Z");
});

test("six-month series aggregates income and expenses by calendar month", () => {
  const result = buildSixMonthSeries([
    { type: "INCOME", amount: 1000, transactionDate: new Date("2026-08-05T00:00:00Z") },
    { type: "EXPENSE", amount: 250, transactionDate: new Date("2026-08-06T00:00:00Z") },
    { type: "EXPENSE", amount: 80, transactionDate: new Date("2026-07-01T00:00:00Z") },
  ], 2026, 8);
  assert.equal(result.length, 6);
  assert.deepEqual(result.at(-1), { key: "2026-08", label: "Aug", income: 1000, expense: 250 });
  assert.equal(result.at(-2)?.expense, 80);
});
