import { jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "token" as const;

export type SessionPayload = JWTPayload & {
  sub?: string;
  role?: string;
  email?: string;
};

/**
 * Verifies an HS256 JWT (same algorithm as `jsonwebtoken` defaults on the backend).
 * Expects `JWT_SECRET` to match the ClipS API `JWT_SECRET`.
 *
 * Expected cookie (set by your API or auth route):
 * - Name: `token`
 * - Value: raw JWT string (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
 * - Options: `HttpOnly; Secure` in production; `Path=/`; `SameSite=Lax` (or `None` if cross-site)
 */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<SessionPayload> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionPayload;
}

export function isAdminRole(payload: SessionPayload): boolean {
  return payload.role === "admin";
}
