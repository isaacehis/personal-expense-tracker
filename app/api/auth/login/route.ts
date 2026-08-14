import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  createSessionValues,
  setSessionCookie,
} from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function invalidCredentialsResponse() {
  return NextResponse.json(
    {
      message: "The email address or password is incorrect.",
    },
    {
      status: 401,
    },
  );
}

export async function POST(request: Request) {
  try {
    let requestBody: unknown;

    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        {
          message: "The request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const validationResult = loginSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Please correct the highlighted fields.",
          errors: validationResult.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const { email, password } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        currency: true,
        timezone: true,
        createdAt: true,
      },
    });

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

    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: sessionValues.tokenHash,
        expiresAt: sessionValues.expiresAt,
      },
    });

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

    return NextResponse.json(
      {
        message: "Login failed. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}