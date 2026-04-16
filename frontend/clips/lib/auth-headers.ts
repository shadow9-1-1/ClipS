const TOKEN_COOKIE = "token";

/** Readable `token` cookie → `Authorization` header (HttpOnly cookies are not readable here). */
export function getBearerAuthHeader(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${TOKEN_COOKIE}=([^;]*)`)
  );
  const raw = match?.[1];
  if (!raw) return {};
  const token = decodeURIComponent(raw);
  return { Authorization: `Bearer ${token}` };
}
