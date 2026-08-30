import type { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";
import {
  createTransactionSchema,
  transactionQuerySchema,
} from "@/lib/validation/transaction";

export const runtime = "nodejs";

function serializeTransaction<T extends { amount: { toFixed(value: number): string } }>(
  transaction: T,
) {
  return { ...transaction, amount: transaction.amount.toFixed(2) };
}

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const url = new URL(request.url);
    const parsed = transactionQuerySchema.safeParse(
      Object.fromEntries(url.searchParams.entries()),
    );

    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "The transaction filters are invalid.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { search, type, categoryId, month, dateFrom, dateTo, page, pageSize } =
      parsed.data;
    const where: Prisma.TransactionWhereInput = {
      userId: session.user.id,
      ...(type ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: "insensitive" } },
              { note: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    if (month) {
      const [year, monthNumber] = month.split("-").map(Number);
      where.transactionDate = {
        gte: new Date(Date.UTC(year, monthNumber - 1, 1)),
        lt: new Date(Date.UTC(year, monthNumber, 1)),
      };
    } else if (dateFrom || dateTo) {
      where.transactionDate = {
        ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00.000Z`) } : {}),
        ...(dateTo
          ? {
              lt: new Date(
                new Date(`${dateTo}T00:00:00.000Z`).getTime() + 86_400_000,
              ),
            }
          : {}),
      };
    }

    const result = await withUserContext(session.user.id, async (database) => {
      const [transactions, total] = await Promise.all([
        database.transaction.findMany({
          where,
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            note: true,
            transactionDate: true,
            createdAt: true,
            category: {
              select: { id: true, name: true, color: true, icon: true },
            },
          },
          orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        database.transaction.count({ where }),
      ]);

      return { transactions, total };
    });

    return NextResponse.json({
      transactions: result.transactions.map(serializeTransaction),
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
      },
    });
  } catch (error) {
    console.error("Unable to load transactions:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to load transactions.");
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

    const result = createTransactionSchema.safeParse(body.data);
    if (!result.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the submitted information.",
        result.error.flatten().fieldErrors,
      );
    }

    const data = result.data;
    const transaction = await withUserContext(
      session.user.id,
      async (database) => {
        const category = await database.category.findFirst({
          where: {
            id: data.categoryId,
            userId: session.user.id,
            type: data.type,
          },
          select: { id: true },
        });
        if (!category) return null;

        return database.transaction.create({
          data: {
            userId: session.user.id,
            categoryId: category.id,
            type: data.type,
            amount: data.amount,
            description: data.description,
            note: data.note || null,
            transactionDate: new Date(`${data.transactionDate}T00:00:00.000Z`),
          },
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            note: true,
            transactionDate: true,
            createdAt: true,
            category: {
              select: { id: true, name: true, color: true, icon: true },
            },
          },
        });
      },
    );

    if (!transaction) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "The selected category is unavailable for this transaction type.",
      );
    }

    return NextResponse.json(
      {
        message: "Transaction created successfully.",
        transaction: serializeTransaction(transaction),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unable to create transaction:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to create transaction.");
  }
}
