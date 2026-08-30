import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "FORBIDDEN"
  | "INVALID_CONTENT_TYPE"
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  fields?: ZodError["flatten"] extends () => infer Result
    ? Result extends { fieldErrors: infer Fields }
      ? Fields
      : never
    : never,
) {
  return NextResponse.json(
    {
      message,
      error: {
        code,
        message,
        ...(fields ? { fields } : {}),
      },
      ...(fields ? { errors: fields } : {}),
    },
    { status },
  );
}

export function requireJsonRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("application/json")) {
    return apiError(
      415,
      "INVALID_CONTENT_TYPE",
      "Content-Type must be application/json.",
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 32_768) {
    return apiError(413, "INVALID_REQUEST", "Request body is too large.");
  }

  return null;
}

export function requireSameOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    try {
      if (new URL(origin).origin === requestUrl.origin) return null;
    } catch {
      // Return the generic origin error below.
    }
  } else if (referer) {
    try {
      if (new URL(referer).origin === requestUrl.origin) return null;
    } catch {
      // Return the generic origin error below.
    }
  }

  return apiError(403, "FORBIDDEN", "The request origin is not allowed.");
}

export async function readJson(request: Request) {
  try {
    return { data: (await request.json()) as unknown, error: null };
  } catch {
    return {
      data: null,
      error: apiError(
        400,
        "INVALID_REQUEST",
        "Request body must contain valid JSON.",
      ),
    };
  }
}

export function validateMutationRequest(request: Request) {
  return requireSameOrigin(request) ?? requireJsonRequest(request);
}
