import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import { apiError } from "@/lib/api";
import { withUserContext } from "@/lib/database-context";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const categories = await withUserContext(session.user.id, (database) =>
      database.category.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
          icon: true,
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
      }),
    );

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Unable to load categories:", error);

    return apiError(500, "INTERNAL_ERROR", "Unable to load categories.");
  }
}
