/**
 * When `NEXT_PUBLIC_API_URL` is set, the app calls the API directly (e.g. production).
 * When unset, the browser uses same-origin `/clips-api/...` (see `next.config.ts` rewrites)
 * so requests hit Express without cross-origin / DNS issues on Windows.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return "";
  }
  return (process.env.INTERNAL_API_URL || "http://127.0.0.1:5000").replace(
    /\/$/,
    ""
  );
}

/** Prefix before `/v1/...` — either `https://api.example.com/api` or `/clips-api` (browser proxy). */
export function getApiPrefix(): string {
  const base = getApiBaseUrl();
  if (base) {
    return `${base}/api`;
  }
  return "/clips-api";
}

/** Parse JSON from a fetch Response without throwing on empty or invalid bodies. */
export async function readResponseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export function getFetchErrorMessage(err: unknown): string {
  if (err instanceof TypeError && /fetch|network|load failed|Failed to fetch/i.test(String(err.message))) {
    return "Could not reach the API. Ensure the backend is running (e.g. localhost:5000) and try again.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}
