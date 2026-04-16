"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  bio?: string | null;
  avatarKey?: string | null;
  active?: boolean;
  accountStatus?: string;
  notificationPreferences?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchMeResult =
  | { kind: "ok"; user: User }
  | { kind: "unauthorized" }
  | { kind: "error"; message: string; retryable?: boolean };

async function fetchMeOnce(apiPrefix: string): Promise<FetchMeResult> {
  let res: Response;
  try {
    res = await fetch(`${apiPrefix}/v1/users/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...getBearerAuthHeader(),
      },
      cache: "no-store",
    });
  } catch {
    return { kind: "error", message: "Network error", retryable: true };
  }

  if (res.status === 401) {
    return { kind: "unauthorized" };
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string };
      if (typeof body?.message === "string") message = body.message;
    } catch {
      /* ignore */
    }
    const retryable = res.status >= 500;
    return { kind: "error", message, retryable };
  }

  const json = (await res.json()) as { data?: { user?: User } };
  const user = json?.data?.user;
  if (!user || typeof user.id !== "string") {
    return { kind: "error", message: "Invalid user payload", retryable: false };
  }
  return { kind: "ok", user };
}

async function fetchMeWithRetry(apiPrefix: string): Promise<FetchMeResult> {
  const maxAttempts = 3;
  let lastError = "Network error";

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await fetchMeOnce(apiPrefix);

    if (result.kind !== "error") {
      return result;
    }

    lastError = result.message;
    const canRetry =
      result.retryable === true && attempt < maxAttempts - 1;

    if (canRetry) {
      await delay(250 * (attempt + 1));
      continue;
    }

    return result;
  }

  return { kind: "error", message: lastError };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef<Promise<void> | null>(null);

  const loadUser = useCallback(async () => {
    if (inFlightRef.current) {
      await inFlightRef.current;
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchMeWithRetry(getApiPrefix());

      if (result.kind === "ok") {
        setUser(result.user);
        setError(null);
      } else if (result.kind === "unauthorized") {
        setUser(null);
        setError(null);
      } else {
        setUser(null);
        setError(result.message);
      }

      setLoading(false);
    };

    const p = run();
    inFlightRef.current = p.finally(() => {
      inFlightRef.current = null;
    });
    await p;
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      refetch: loadUser,
      logout,
    }),
    [user, loading, error, loadUser, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
