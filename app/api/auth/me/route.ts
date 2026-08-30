import { getCurrentSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    return NextResponse.json(
      {
        user: session.user,
        session: {
          expiresAt: session.expiresAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Current user lookup failed:", error);

    return apiError(500, "INTERNAL_ERROR", "Unable to retrieve the current user.");
  }
}
