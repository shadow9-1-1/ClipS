import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  isAdminRole,
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

export async function middleware(request: NextRequest) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error(
      "[middleware] JWT_SECRET is not set. Denying access to protected routes."
    );
    return loginRedirect(request);
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return loginRedirect(request);
  }

  try {
    const payload = await verifySessionToken(token, secret);

    if (request.nextUrl.pathname.startsWith("/admin") && !isAdminRole(payload)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    const res = loginRedirect(request);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/upload/:path*", "/settings/:path*", "/admin/:path*"],
};
