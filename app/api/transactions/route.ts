import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { createTransactionSchema } from "@/lib/validation/transaction";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Authentication is required.",
        },
        {
          status: 401,
        },
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
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
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
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
    });

    return NextResponse.json({
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: transaction.amount.toFixed(2),
      })),
    });
  } catch (error) {
    console.error("Unable to load transactions:", error);

    return NextResponse.json(
      {
        message: "Unable to load transactions.",
      },
      {
        status: 500,
      },
    );
  }
}
export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          message: "Authentication is required.",
        },
        {
          status: 401,
        },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          message: "Request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const result = createTransactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Please correct the submitted information.",
          errors: result.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const data = result.data;

    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        userId: session.user.id,
        type: data.type,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          message:
            "The selected category does not belong to you or does not match the transaction type.",
        },
        {
          status: 400,
        },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: category.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        note: data.note || null,
        transactionDate: new Date(
          `${data.transactionDate}T00:00:00.000Z`,
        ),
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
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Transaction created successfully.",
        transaction: {
          ...transaction,
          amount: transaction.amount.toFixed(2),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Unable to create transaction:", error);

    return NextResponse.json(
      {
        message: "Unable to create transaction.",
      },
      {
        status: 500,
      },
    );
  }
}