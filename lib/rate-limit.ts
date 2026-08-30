import { createHash } from "node:crypto";
import { Prisma } from "@/app/generated/prisma/client";

import prisma from "@/lib/prisma";

type RateLimitOptions = {
  action: "login" | "register";
  identity: string;
  limit: number;
  windowMs: number;
  blockMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function getClientAddress(request: Request) {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function makeKey(request: Request, identity: string) {
  const salt =
    process.env.RATE_LIMIT_SALT ??
    (process.env.NODE_ENV === "production" ? "" : "local-development");

  if (!salt) {
    throw new Error("RATE_LIMIT_SALT is required in production.");
  }

  return createHash("sha256")
    .update(`${salt}:${getClientAddress(request)}:${identity}`)
    .digest("hex");
}

export async function checkRateLimit(
  request: Request,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = new Date();
  const keyHash = makeKey(request, options.identity);

  async function attempt(): Promise<RateLimitResult> {
    return prisma.$transaction(async (database) => {
    const existing = await database.rateLimit.findUnique({
      where: {
        keyHash_action: { keyHash, action: options.action },
      },
      select: {
        hitCount: true,
        windowStart: true,
        blockedUntil: true,
      },
    });

    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(
          (existing.blockedUntil.getTime() - now.getTime()) / 1_000,
        ),
      };
    }

    const windowExpired =
      !existing || now.getTime() - existing.windowStart.getTime() >= options.windowMs;
    const nextCount = windowExpired ? 1 : existing.hitCount + 1;
    const blockedUntil =
      nextCount > options.limit
        ? new Date(now.getTime() + options.blockMs)
        : null;

    await database.rateLimit.upsert({
      where: {
        keyHash_action: { keyHash, action: options.action },
      },
      create: {
        keyHash,
        action: options.action,
        hitCount: nextCount,
        windowStart: now,
        blockedUntil,
      },
      update: {
        hitCount: nextCount,
        ...(windowExpired ? { windowStart: now } : {}),
        blockedUntil,
      },
    });

    return {
      allowed: blockedUntil === null,
      retryAfterSeconds: blockedUntil
        ? Math.ceil(options.blockMs / 1_000)
        : 0,
    };
    }, { isolationLevel: "Serializable" });
  }

  for (let retry = 0; retry < 3; retry += 1) {
    try {
      return await attempt();
    } catch (error) {
      const isWriteConflict =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034";
      if (!isWriteConflict || retry === 2) throw error;
    }
  }

  throw new Error("Rate-limit transaction could not be completed.");
}
