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
  const pathname = request.nextUrl.pathname;

  // Get auth token
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // If accessing auth pages with token, allow access
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // If no token and not on auth page, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};