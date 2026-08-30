import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";
import { changePasswordSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const requestError = validateMutationRequest(request);
    if (requestError) return requestError;
    const session = await getCurrentSession();
    if (!session) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const body = await readJson(request);
    if (body.error) return body.error;
    const parsed = changePasswordSchema.safeParse(body.data);
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the password fields.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const passwordHash = await withUserContext(session.user.id, (database) =>
      database.user.findFirst({
        where: { id: session.user.id },
        select: { passwordHash: true },
      }),
    );
    if (!passwordHash) {
      return apiError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const passwordMatches = await verifyPassword(
      passwordHash.passwordHash,
      parsed.data.currentPassword,
    );
    if (!passwordMatches) {
      return apiError(400, "INVALID_REQUEST", "The current password is incorrect.");
    }

    const newPasswordHash = await hashPassword(parsed.data.newPassword);
    await withUserContext(session.user.id, async (database) => {
      await database.user.updateMany({
        where: { id: session.user.id },
        data: { passwordHash: newPasswordHash },
      });
      await database.session.updateMany({
        where: {
          userId: session.user.id,
          id: { not: session.id },
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    });

    return NextResponse.json({
      message: "Password changed. Other signed-in sessions were revoked.",
    });
  } catch (error) {
    console.error("Unable to change password:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to change password.");
  }
}
