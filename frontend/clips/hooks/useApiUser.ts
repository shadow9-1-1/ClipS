"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { fetchUserById, fetchUserByUsername } from "@/lib/backend-client";
import { mapApiUserToUi } from "@/lib/backend-adapters";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

const avatarUrlCache = new Map<string, string | null>();
const avatarRequestCache = new Map<string, Promise<string | null>>();

async function resolveAvatarUrlFromKey(avatarKey?: string | null): Promise<string | null> {
  const key = typeof avatarKey === "string" ? avatarKey.trim() : "";
  if (!key || /^https?:\/\//i.test(key)) return key || null;
  if (avatarUrlCache.has(key)) return avatarUrlCache.get(key) ?? null;
  if (avatarRequestCache.has(key)) return avatarRequestCache.get(key) ?? null;

  const request = (async () => {
    const auth = getBearerAuthHeader();
    const res = await fetch(`${getApiPrefix()}/v1/storage/presigned-url`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(("Authorization" in auth) ? auth : {}),
      },
      body: JSON.stringify({
        key,
        bucket: "avatars",
      }),
    });
    if (!res.ok) return null;

    const body = (await res.json().catch(() => ({}))) as { data?: { accessUrl?: string } };
    return body?.data?.accessUrl || null;
  })();

  avatarRequestCache.set(key, request);
  const resolved = await request.catch(() => null);
  avatarRequestCache.delete(key);
  avatarUrlCache.set(key, resolved);
  return resolved;
}

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
      .then(async (res) => {
        const apiUser = res?.data?.user as any;
        if (!apiUser || cancelled) return;
        const mapped = mapApiUserToUi(apiUser);
        const resolvedAvatar = await resolveAvatarUrlFromKey(apiUser.avatarKey);
        if (cancelled) return;
        setUser({
          ...mapped,
          avatar: resolvedAvatar || mapped.avatar,
        });
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
      .then(async (res) => {
        const apiUser = res?.data?.user as any;
        if (!apiUser || cancelled) return;
        const mapped = mapApiUserToUi(apiUser);
        const resolvedAvatar = await resolveAvatarUrlFromKey(apiUser.avatarKey);
        if (cancelled) return;
        setUser({
          ...mapped,
          avatar: resolvedAvatar || mapped.avatar,
        });
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
