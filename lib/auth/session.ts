import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "expense_tracker_session";

const SESSION_DURATION_IN_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function createSessionValues() {
  const token = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

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