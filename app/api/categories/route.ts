import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

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

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
      },
      orderBy: [
        {
          type: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Unable to load categories:", error);

    return NextResponse.json(
      {
        message: "Unable to load categories.",
      },
      {
        status: 500,
      },
    );
  }
}