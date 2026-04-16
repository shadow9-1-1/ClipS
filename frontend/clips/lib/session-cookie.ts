/** Must match `AUTH_COOKIE_NAME` in `@/lib/auth/verify-edge-token` and `getBearerAuthHeader`. */
const SESSION_COOKIE = "token";

const DEFAULT_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/**
 * Persists the API JWT in a readable cookie so `getBearerAuthHeader()` can attach
 * `Authorization: Bearer` on client-side fetches (matches backend `protect` middleware).
 */
export function setSessionTokenCookie(
  token: string,
  maxAgeSec: number = DEFAULT_MAX_AGE_SEC
): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function clearSessionTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0`;
}
