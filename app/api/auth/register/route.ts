import { Prisma, TransactionType } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionValues,
  setSessionCookie,
} from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_CATEGORIES = [
  {
    name: "Salary",
    type: TransactionType.INCOME,
    color: "#16A34A",
    icon: "briefcase",
    isDefault: true,
  },
  {
    name: "Business",
    type: TransactionType.INCOME,
    color: "#0891B2",
    icon: "building",
    isDefault: true,
  },
  {
    name: "Gift",
    type: TransactionType.INCOME,
    color: "#7C3AED",
    icon: "gift",
    isDefault: true,
  },
  {
    name: "Other Income",
    type: TransactionType.INCOME,
    color: "#64748B",
    icon: "circle-plus",
    isDefault: true,
  },
  {
    name: "Food",
    type: TransactionType.EXPENSE,
    color: "#EA580C",
    icon: "utensils",
    isDefault: true,
  },
  {
    name: "Transport",
    type: TransactionType.EXPENSE,
    color: "#2563EB",
    icon: "car",
    isDefault: true,
  },
  {
    name: "Housing",
    type: TransactionType.EXPENSE,
    color: "#9333EA",
    icon: "house",
    isDefault: true,
  },
  {
    name: "Utilities",
    type: TransactionType.EXPENSE,
    color: "#CA8A04",
    icon: "lightbulb",
    isDefault: true,
  },
  {
    name: "Health",
    type: TransactionType.EXPENSE,
    color: "#DC2626",
    icon: "heart-pulse",
    isDefault: true,
  },
  {
    name: "Education",
    type: TransactionType.EXPENSE,
    color: "#4F46E5",
    icon: "graduation-cap",
    isDefault: true,
  },
  {
    name: "Entertainment",
    type: TransactionType.EXPENSE,
    color: "#DB2777",
    icon: "film",
    isDefault: true,
  },
  {
    name: "Other Expense",
    type: TransactionType.EXPENSE,
    color: "#64748B",
    icon: "tag",
    isDefault: true,
  },
] as const;

export async function POST(request: Request) {
  try {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          message: "The request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const validationResult = registerSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Please correct the highlighted fields.",
          errors: validationResult.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const { name, email, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email address already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const passwordHash = await hashPassword(password);
    const sessionValues = createSessionValues();

    const user = await prisma.$transaction(async (database) => {
      const createdUser = await database.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          currency: true,
          timezone: true,
          createdAt: true,
        },
      });

      await database.category.createMany({
        data: DEFAULT_CATEGORIES.map((category) => ({
          userId: createdUser.id,
          ...category,
        })),
      });

      await database.session.create({
        data: {
          userId: createdUser.id,
          tokenHash: sessionValues.tokenHash,
          expiresAt: sessionValues.expiresAt,
        },
      });

      return createdUser;
    });

    await setSessionCookie(
      sessionValues.token,
      sessionValues.expiresAt,
    );

    return NextResponse.json(
      {
        message: "Registration successful.",
        user,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "An account with this email address already exists.",
        },
        {
          status: 409,
        },
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      {
        message: "Registration failed. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}