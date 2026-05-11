"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { fetchUserById, fetchUserByUsername } from "@/lib/backend-client";
import { mapApiUserToUi } from "@/lib/backend-adapters";

export function useApiUser(userId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchUserById(userId)
      .then((res) => {
        const apiUser = res?.data?.user as any;
        if (!apiUser || cancelled) return;
        setUser(mapApiUserToUi(apiUser));
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { user, loading };
}

export function useApiUserByUsername(username?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(username));

  useEffect(() => {
    let cancelled = false;
    const normalized = username?.trim();
    if (!normalized) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchUserByUsername(normalized)
      .then((res) => {
        const apiUser = res?.data?.user as any;
        if (!apiUser || cancelled) return;
        setUser(mapApiUserToUi(apiUser));
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  return { user, loading };
}
