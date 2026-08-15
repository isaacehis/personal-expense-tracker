import { getCurrentSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

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

    return NextResponse.json(
      {
        message: "Unable to retrieve the current user.",
      },
      {
        status: 500,
      },
    );
  }
}