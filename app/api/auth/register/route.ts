import { Prisma, TransactionType } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionValues,
  setSessionCookie,
} from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";
import { NextResponse } from "next/server";
import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import {
  withLoginEmail,
  withRegistrationContext,
} from "@/lib/database-context";
import { checkRateLimit } from "@/lib/rate-limit";

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
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;

    const requestBody = await readJson(request);
    if (requestBody.error) return requestBody.error;

    const validationResult = registerSchema.safeParse(requestBody.data);

    if (!validationResult.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the highlighted fields.",
        validationResult.error.flatten().fieldErrors,
      );
    }

    const { name, email, password } = validationResult.data;
    const rateLimit = await checkRateLimit(request, {
      action: "register",
      identity: email,
      limit: 5,
      windowMs: 60 * 60 * 1_000,
      blockMs: 30 * 60 * 1_000,
    });

    if (!rateLimit.allowed) {
      const response = apiError(
        429,
        "RATE_LIMITED",
        "Too many registration attempts. Please try again later.",
      );
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const existingUser = await withLoginEmail(email, (database) =>
      database.user.findUnique({
        where: { email },
        select: { id: true },
      }),
    );

    if (existingUser) {
      return apiError(
        409,
        "CONFLICT",
        "An account could not be created with these details.",
      );
    }

    const passwordHash = await hashPassword(password);
    const sessionValues = createSessionValues();

    const user = await withRegistrationContext(async (database) => {
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

      await database.$executeRaw`SELECT set_config('app.current_user_id', ${createdUser.id}, true)`;

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
      return apiError(
        409,
        "CONFLICT",
        "An account could not be created with these details.",
      );
    }

    console.error("Registration failed:", error);

    return apiError(
      500,
      "INTERNAL_ERROR",
      "Registration failed. Please try again.",
    );
  }
}
