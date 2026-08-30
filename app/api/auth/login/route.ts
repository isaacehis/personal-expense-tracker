import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  createSessionValues,
  setSessionCookie,
} from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";
import { NextResponse } from "next/server";
import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { withLoginEmail, withUserContext } from "@/lib/database-context";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function invalidCredentialsResponse() {
  return apiError(
    401,
    "AUTHENTICATION_REQUIRED",
    "The email address or password is incorrect.",
  );
}

export async function POST(request: Request) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;

    const requestBody = await readJson(request);
    if (requestBody.error) return requestBody.error;

    const validationResult = loginSchema.safeParse(requestBody.data);

    if (!validationResult.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the highlighted fields.",
        validationResult.error.flatten().fieldErrors,
      );
    }

    const { email, password } = validationResult.data;
    const rateLimit = await checkRateLimit(request, {
      action: "login",
      identity: email,
      limit: 8,
      windowMs: 15 * 60 * 1_000,
      blockMs: 15 * 60 * 1_000,
    });

    if (!rateLimit.allowed) {
      const response = apiError(
        429,
        "RATE_LIMITED",
        "Too many sign-in attempts. Please try again later.",
      );
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const user = await withLoginEmail(email, (database) =>
      database.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          currency: true,
          timezone: true,
          createdAt: true,
        },
      }),
    );

    if (!user) {
      await hashPassword(password);
      return invalidCredentialsResponse();
    }

    const passwordMatches = await verifyPassword(
      user.passwordHash,
      password,
    );

    if (!passwordMatches) {
      return invalidCredentialsResponse();
    }

    const sessionValues = createSessionValues();

    await withUserContext(user.id, (database) =>
      database.session.create({
        data: {
          userId: user.id,
          tokenHash: sessionValues.tokenHash,
          expiresAt: sessionValues.expiresAt,
        },
        select: { id: true },
      }),
    );

    await setSessionCookie(
      sessionValues.token,
      sessionValues.expiresAt,
    );

    return NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
          timezone: user.timezone,
          createdAt: user.createdAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Login failed:", error);

    return apiError(
      500,
      "INTERNAL_ERROR",
      "Login failed. Please try again.",
    );
  }
}
