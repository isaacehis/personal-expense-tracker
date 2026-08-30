import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  getSessionToken,
  hashSessionToken,
} from "@/lib/auth/session";
import { apiError, requireSameOrigin } from "@/lib/api";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const originError = requireSameOrigin(request);
    if (originError) return originError;

    const token = await getSessionToken();
    const session = await getCurrentSession();

    if (token && session) {
      await withUserContext(session.user.id, (database) =>
        database.session.updateMany({
          where: {
            id: session.id,
            userId: session.user.id,
            tokenHash: hashSessionToken(token),
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        }),
      );
    }

    await clearSessionCookie();

    return NextResponse.json(
      {
        message: "Logout successful.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Logout failed:", error);

    return apiError(
      500,
      "INTERNAL_ERROR",
      "Logout failed. Please try again.",
    );
  }
}
