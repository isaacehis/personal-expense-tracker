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

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const session = await prisma.session.findFirst({
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

  return session;
}