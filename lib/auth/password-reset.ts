import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1_000;
const USER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ResetTokenPayload = {
  userId: string;
  expiresAt: number;
  nonce: string;
};

function getSigningSecret() {
  const secret =
    process.env.PASSWORD_RESET_SECRET ??
    process.env.RATE_LIMIT_SALT ??
    (process.env.NODE_ENV === "production"
      ? ""
      : "local-development-password-reset-secret-only");

  if (secret.length < 32) {
    throw new Error("A password-reset secret of at least 32 characters is required.");
  }

  return secret;
}

function sign(payload: string, passwordHash: string) {
  return createHmac("sha256", getSigningSecret())
    .update(`expense-track-password-reset:${payload}:${passwordHash}`)
    .digest("base64url");
}

export function createPasswordResetToken(userId: string, passwordHash: string) {
  const payload: ResetTokenPayload = {
    userId,
    expiresAt: Date.now() + RESET_TOKEN_LIFETIME_MS,
    nonce: randomBytes(16).toString("base64url"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload, passwordHash)}`;
}

export function readPasswordResetToken(token: string) {
  const [encodedPayload, signature, extra] = token.split(".");
  if (
    !encodedPayload ||
    !signature ||
    extra ||
    signature.length !== 43 ||
    !/^[A-Za-z0-9_-]+$/.test(signature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as Partial<ResetTokenPayload>;

    if (
      typeof payload.userId !== "string" ||
      !USER_ID_PATTERN.test(payload.userId) ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.nonce !== "string" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return { encodedPayload, signature, userId: payload.userId };
  } catch {
    return null;
  }
}

export function verifyPasswordResetToken(
  encodedPayload: string,
  signature: string,
  passwordHash: string,
) {
  const expected = Buffer.from(sign(encodedPayload, passwordHash));
  const received = Buffer.from(signature);

  return expected.length === received.length && timingSafeEqual(expected, received);
}
