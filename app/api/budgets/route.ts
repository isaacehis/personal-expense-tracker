import { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";
import { calculateBudgetProgress, getMonthRange } from "@/lib/finance";
import { budgetQuerySchema, budgetSchema } from "@/lib/validation/budget";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const url = new URL(request.url);
    const parsed = budgetQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries()),
    );
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Select a valid budget month.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { year, month } = parsed.data;
    const range = getMonthRange(year, month);
    const result = await withUserContext(session.user.id, async (database) => {
      const [budgets, expenses] = await Promise.all([
        database.budget.findMany({
          where: { userId: session.user.id, year, month },
          select: {
            id: true,
            amount: true,
            month: true,
            year: true,
            category: { select: { id: true, name: true, color: true } },
          },
          orderBy: { category: { name: "asc" } },
        }),
        database.transaction.groupBy({
          by: ["categoryId"],
          where: {
            userId: session.user.id,
            type: "EXPENSE",
            transactionDate: { gte: range.start, lt: range.end },
          },
          _sum: { amount: true },
        }),
      ]);
      return { budgets, expenses };
    });

    const spent = new Map(
      result.expenses.map((item) => [item.categoryId, Number(item._sum.amount ?? 0)]),
    );

    return NextResponse.json({
      budgets: result.budgets.map((budget) => {
        const amount = Number(budget.amount);
        const actual = spent.get(budget.category.id) ?? 0;
        return {
          ...budget,
          amount: budget.amount.toFixed(2),
          spent: actual.toFixed(2),
          remaining: (amount - actual).toFixed(2),
          percentage: calculateBudgetProgress(actual, amount),
          overspent: actual > amount,
        };
      }),
    });
  } catch (error) {
    console.error("Unable to load budgets:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to load budgets.");
  }
}

export async function POST(request: Request) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;
    const session = await getCurrentSession();
    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const body = await readJson(request);
    if (body.error) return body.error;
    const parsed = budgetSchema.safeParse(body.data);
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the submitted budget.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;
    const budget = await withUserContext(session.user.id, async (database) => {
      const category = await database.category.findFirst({
        where: {
          id: data.categoryId,
          userId: session.user.id,
          type: "EXPENSE",
        },
        select: { id: true },
      });
      if (!category) return null;

      return database.budget.create({
        data: { ...data, userId: session.user.id },
        select: {
          id: true,
          amount: true,
          month: true,
          year: true,
          category: { select: { id: true, name: true, color: true } },
        },
      });
    });

    if (!budget) {
      return apiError(400, "INVALID_REQUEST", "Select one of your expense categories.");
    }

    return NextResponse.json(
      {
        message: "Budget created successfully.",
        budget: { ...budget, amount: budget.amount.toFixed(2) },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError(409, "CONFLICT", "A budget already exists for that category and month.");
    }
    console.error("Unable to create budget:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to create budget.");
  }
}
