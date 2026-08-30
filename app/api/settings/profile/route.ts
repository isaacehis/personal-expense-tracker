import { Prisma } from "@/app/generated/prisma/client";
import { NextResponse } from "next/server";

import { apiError, readJson, validateMutationRequest } from "@/lib/api";
import { getCurrentSession } from "@/lib/auth/session";
import { withUserContext } from "@/lib/database-context";
import { profileSchema } from "@/lib/validation/auth";

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
    const parsed = profileSchema.safeParse(body.data);
    if (!parsed.success) {
      return apiError(
        400,
        "INVALID_REQUEST",
        "Please correct the submitted profile.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const user = await withUserContext(session.user.id, async (database) => {
      await database.user.updateMany({
        where: { id: session.user.id },
        data: parsed.data,
      });
      return database.user.findFirst({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          currency: true,
          timezone: true,
          createdAt: true,
        },
      });
    });

    return NextResponse.json({ message: "Profile updated successfully.", user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return apiError(409, "CONFLICT", "That email address is already in use.");
    }
    console.error("Unable to update profile:", error);
    return apiError(500, "INTERNAL_ERROR", "Unable to update profile.");
  }
}
