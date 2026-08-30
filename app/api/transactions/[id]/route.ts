import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";
import { updateTransactionSchema } from "@/lib/validation/transaction";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/transactions/[id]">,
) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;
    const session = await getCurrentSession();
    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const { id } = await context.params;
    const body = await readJson(request);
    if (body.error) return body.error;
    const parsed = updateTransactionSchema.safeParse(body.data);
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the submitted information.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;
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
        if (!category) return "INVALID_CATEGORY" as const;

        const updated = await database.transaction.updateMany({
          where: { id, userId: session.user.id },
          data: {
            type: data.type,
            amount: data.amount,
            description: data.description,
            note: data.note || null,
            categoryId: category.id,
            transactionDate: new Date(`${data.transactionDate}T00:00:00.000Z`),
          },
        });
        if (updated.count === 0) return null;

        return database.transaction.findFirst({
          where: { id, userId: session.user.id },
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

    if (transaction === "INVALID_CATEGORY") {
      return apiError(
        400,
        "INVALID_REQUEST",
        "The selected category is unavailable for this transaction type.",
      );
    }
    if (!transaction) {
      return apiError(404, "NOT_FOUND", "Transaction not found.");
    }

    return NextResponse.json({
      message: "Transaction updated successfully.",
      transaction: { ...transaction, amount: transaction.amount.toFixed(2) },
    });
  } catch (error) {
    console.error("Unable to update transaction:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to update transaction.");
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/transactions/[id]">,
) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;
    const session = await getCurrentSession();
    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const { id } = await context.params;
    const deleted = await withUserContext(session.user.id, (database) =>
      database.transaction.deleteMany({
        where: { id, userId: session.user.id },
      }),
    );
    if (deleted.count === 0) {
      return apiError(404, "NOT_FOUND", "Transaction not found.");
    }

    return NextResponse.json({ message: "Transaction deleted successfully." });
  } catch (error) {
    console.error("Unable to delete transaction:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to delete transaction.");
  }
}
