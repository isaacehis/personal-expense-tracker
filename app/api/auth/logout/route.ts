import { NextResponse } from "next/server";

import {
  clearSessionCookie,
  getSessionToken,
  hashSessionToken,
} from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  try {
    const token = await getSessionToken();

    if (token) {
      await prisma.session.updateMany({
        where: {
          tokenHash: hashSessionToken(token),
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
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

    return NextResponse.json(
      {
        message: "Logout failed. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}