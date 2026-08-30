import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "expense_tracker_session";

const SESSION_DURATION_IN_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionValues() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_IN_DAYS * MILLISECONDS_PER_DAY,
  );

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

export async function getSessionToken() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function setSessionCookie(
  token: string,
  expiresAt: Date,
) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}

export async function getCurrentSession() {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  return prisma.$transaction(async (database) => {
    await database.$executeRaw`SELECT set_config('app.current_session_hash', ${tokenHash}, true)`;

    return database.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
            timezone: true,
            createdAt: true,
          },
        },
      },
    });
  });
}
