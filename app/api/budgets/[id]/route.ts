import { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";
import { budgetSchema } from "@/lib/validation/budget";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/budgets/[id]">,
) {
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

    const { id } = await context.params;
    const data = parsed.data;
    const result = await withUserContext(session.user.id, async (database) => {
      const category = await database.category.findFirst({
        where: {
          id: data.categoryId,
          userId: session.user.id,
          type: "EXPENSE",
        },
        select: { id: true },
      });
      if (!category) return "INVALID_CATEGORY" as const;

      const updated = await database.budget.updateMany({
        where: { id, userId: session.user.id },
        data,
      });
      return updated.count;
    });

    if (result === "INVALID_CATEGORY") {
      return apiError(400, "INVALID_REQUEST", "Select one of your expense categories.");
    }
    if (result === 0) return apiError(404, "NOT_FOUND", "Budget not found.");

    return NextResponse.json({ message: "Budget updated successfully." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError(409, "CONFLICT", "A budget already exists for that category and month.");
    }
    console.error("Unable to update budget:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to update budget.");
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/budgets/[id]">,
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
      database.budget.deleteMany({ where: { id, userId: session.user.id } }),
    );
    if (deleted.count === 0) return apiError(404, "NOT_FOUND", "Budget not found.");

    return NextResponse.json({ message: "Budget deleted successfully." });
  } catch (error) {
    console.error("Unable to delete budget:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to delete budget.");
  }
}
