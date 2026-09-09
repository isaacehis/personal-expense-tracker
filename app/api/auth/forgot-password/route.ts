import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { createPasswordResetToken } from "@/lib/auth/password-reset";
import { withLoginEmail } from "@/lib/database-context";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

const successMessage =
  "If an account uses that email address, a password-reset link has been sent.";

export async function POST(request: Request) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;

    const body = await readJson(request);
    if (body.error) return body.error;

    const parsed = forgotPasswordSchema.safeParse(body.data);
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Enter the email address used to create your account.",
        parsed.error.flatten().fieldErrors,
      );
    }

    if (!isPasswordResetEmailConfigured()) {
      return apiError(
        503,
        "INTERNAL_ERROR",
        "Password reset email is temporarily unavailable. Please contact the administrator.",
      );
    }

    const rateLimit = await checkRateLimit(request, {
      action: "password-reset",
      identity: parsed.data.email,
      limit: 4,
      windowMs: 30 * 60 * 1_000,
      blockMs: 30 * 60 * 1_000,
    });

    if (!rateLimit.allowed) {
      const response = apiError(
        429,
        "RATE_LIMITED",
        "Too many reset requests. Please try again later.",
      );
      response.headers.set("Retry-After", String(rateLimit.retryAfterSeconds));
      return response;
    }

    const user = await withLoginEmail(parsed.data.email, (database) =>
      database.user.findUnique({
        where: { email: parsed.data.email },
        select: { id: true, email: true, passwordHash: true },
      }),
    );

    if (user) {
      const token = createPasswordResetToken(user.id, user.passwordHash);
      const resetUrl = new URL(
        "/reset-password",
        process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin,
      );
      resetUrl.searchParams.set("token", token);
      await sendPasswordResetEmail({ to: user.email, resetUrl: resetUrl.toString() });
    }

    return NextResponse.json({ message: successMessage });
  } catch (error) {
    console.error("Unable to request a password reset:", error);
    return apiError(
      500,
      "INTERNAL_ERROR",
      "Unable to send the reset email. Please try again later.",
    );
  }
}
