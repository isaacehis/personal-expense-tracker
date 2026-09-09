import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { clearSessionCookie } from "@/lib/auth/session";
import {
  readPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/auth/password-reset";
import { withUserContext } from "@/lib/database-context";
import { checkRateLimit } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

function invalidTokenResponse() {
  return apiError(
    400,
    "INVALID_REQUEST",
    "This password-reset link is invalid or has expired. Request a new link.",
  );
}

export async function POST(request: Request) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;

    const body = await readJson(request);
    if (body.error) return body.error;

    const parsed = resetPasswordSchema.safeParse(body.data);
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the highlighted fields.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const tokenData = readPasswordResetToken(parsed.data.token);
    if (!tokenData) return invalidTokenResponse();

    const rateLimit = await checkRateLimit(request, {
      action: "password-reset",
      identity: tokenData.userId,
      limit: 6,
      windowMs: 30 * 60 * 1_000,
      blockMs: 30 * 60 * 1_000,
    });
    if (!rateLimit.allowed) {
      const response = apiError(
        429,
        "RATE_LIMITED",
        "Too many reset attempts. Please request a new link later.",
      );
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const user = await withUserContext(tokenData.userId, (database) =>
      database.user.findFirst({
        where: { id: tokenData.userId },
        select: { passwordHash: true },
      }),
    );

    if (
      !user ||
      !verifyPasswordResetToken(
        tokenData.encodedPayload,
        tokenData.signature,
        user.passwordHash,
      )
    ) {
      return invalidTokenResponse();
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await withUserContext(tokenData.userId, async (database) => {
      await database.user.updateMany({
        where: { id: tokenData.userId },
        data: { passwordHash },
      });
      await database.session.updateMany({
        where: { userId: tokenData.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
    await clearSessionCookie();

    return NextResponse.json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Unable to reset password:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to reset password.");
  }
}
