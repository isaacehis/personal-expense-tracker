import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import prisma from "../lib/prisma";

const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const runId = randomUUID().slice(0, 8);
const emails = [`smoke-a-${runId}@example.test`, `smoke-b-${runId}@example.test`];

async function request(path: string, options: RequestInit = {}, cookie?: string) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Origin: baseUrl,
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers,
    },
  });
}

async function register(email: string) {
  const response = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: `Smoke ${runId}`, email, password: "SmokePassword123!", confirmPassword: "SmokePassword123!" }),
  });
  const body = await response.json();
  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(JSON.stringify(body).includes("passwordHash"), false);
  const setCookie = response.headers.get("set-cookie");
  assert.ok(setCookie?.includes("HttpOnly"));
  return setCookie!.split(";", 1)[0];
}

async function main() {
  let cookieA = "";
  let cookieB = "";
  try {
    const unauthenticated = await request("/api/transactions");
    assert.equal(unauthenticated.status, 401);

    const wrongOrigin = await fetch(`${baseUrl}/api/auth/login`, { method: "POST", headers: { Origin: "https://attacker.example", "Content-Type": "application/json" }, body: "{}" });
    assert.equal(wrongOrigin.status, 403);
    const wrongContentType = await request("/api/auth/login", { method: "POST", headers: { "Content-Type": "text/plain" }, body: "{}" });
    assert.equal(wrongContentType.status, 415);

    cookieA = await register(emails[0]);
    cookieB = await register(emails[1]);

    const categoriesAResponse = await request("/api/categories", {}, cookieA);
    const categoriesA = (await categoriesAResponse.json()).categories as Array<{ id: string; type: string }>;
    const categoryA = categoriesA.find((category) => category.type === "EXPENSE");
    assert.ok(categoryA);

    const createdResponse = await request("/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "EXPENSE", amount: "50.00", description: "Isolation test", note: "API smoke", categoryId: categoryA.id, transactionDate: "2026-08-30" }) }, cookieA);
    const createdBody = await createdResponse.json();
    assert.equal(createdResponse.status, 201, JSON.stringify(createdBody));
    const transactionId = createdBody.transaction.id as string;

    const ownList = await (await request("/api/transactions?search=Isolation", {}, cookieA)).json();
    assert.equal(ownList.transactions.some((item: { id: string }) => item.id === transactionId), true);
    const otherList = await (await request("/api/transactions?search=Isolation", {}, cookieB)).json();
    assert.equal(otherList.transactions.some((item: { id: string }) => item.id === transactionId), false);

    const forbiddenDelete = await request(`/api/transactions/${transactionId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: "{}" }, cookieB);
    assert.equal(forbiddenDelete.status, 404);

    const budgetResponse = await request("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: categoryA.id, amount: "40.00", month: 8, year: 2026 }) }, cookieA);
    assert.equal(budgetResponse.status, 201, await budgetResponse.text());
    const budgets = await (await request("/api/budgets?month=8&year=2026", {}, cookieA)).json();
    assert.equal(budgets.budgets[0].spent, "50.00");
    assert.equal(budgets.budgets[0].overspent, true);

    const rlsRows = await prisma.$queryRaw<Array<{ relname: string; relrowsecurity: boolean }>>`
      SELECT relname, relrowsecurity FROM pg_class
      WHERE relname IN ('users', 'categories', 'transactions', 'budgets', 'sessions', 'rate_limits')
    `;
    assert.equal(rlsRows.length, 6);
    assert.equal(rlsRows.every((row) => row.relrowsecurity), true);
    console.log("API smoke test passed: authentication rejection, origin/content checks, user isolation, ownership denial, budget calculations, and RLS enablement.");
  } finally {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error("API smoke test failed:", error); process.exitCode = 1; });
