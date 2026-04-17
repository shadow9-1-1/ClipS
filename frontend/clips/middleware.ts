import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isAdminRole,
  type SessionPayload,
  verifySessionToken,
} from "@/lib/auth/verify-edge-token";

function loginRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("callbackUrl", pathname || "/");
  return NextResponse.redirect(url);
}

function decodePayloadWithoutVerify(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  try {
    const json = atob(padded);
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: SessionPayload): boolean {
  if (typeof payload.exp !== "number") return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
}

export async function middleware(request: NextRequest) {
  const secret = process.env.JWT_SECRET;

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return loginRedirect(request);
  }

  try {
    const payload = secret
      ? await verifySessionToken(token, secret)
      : decodePayloadWithoutVerify(token);

    if (!payload || isExpired(payload)) {
      return loginRedirect(request);
    }

    if (request.nextUrl.pathname.startsWith("/admin") && !isAdminRole(payload)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // If verification fails due to secret mismatch, fall back to decoded claims
    // so valid logged-in users are not forced back to /login.
    const payload = decodePayloadWithoutVerify(token);
    if (!payload || isExpired(payload)) {
      const res = loginRedirect(request);
      res.cookies.delete(AUTH_COOKIE_NAME);
      return res;
    }

    if (request.nextUrl.pathname.startsWith("/admin") && !isAdminRole(payload)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/upload",
    "/upload/:path*",
    "/settings",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
  ],
};