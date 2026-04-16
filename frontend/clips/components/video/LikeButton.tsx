"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { Spinner } from "@/components/ui/Spinner";

type LikeButtonProps = {
  videoId: string;
};

export function LikeButton({ videoId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const snapshotRef = useRef({ liked: false, likesCount: 0 });
  const errorClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEngagement = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {
        ...getBearerAuthHeader(),
      };
      const res = await fetch(
        `${getApiBaseUrl()}/api/v1/videos/${videoId}/engagement`,
        { credentials: "include", cache: "no-store", headers }
      );
      if (!res.ok) return;
      const json = (await res.json()) as {
        data?: { likesCount?: number; liked?: boolean };
      };
      const lc = json?.data?.likesCount ?? 0;
      const lk = Boolean(json?.data?.liked);
      setLikesCount(lc);
      setLiked(lk);
      snapshotRef.current = { liked: lk, likesCount: lc };
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  /** Sync counts from server without toggling the initial loading UI */
  const syncEngagement = useCallback(async () => {
    try {
      const headers: Record<string, string> = {
        ...getBearerAuthHeader(),
      };
      const res = await fetch(
        `${getApiBaseUrl()}/api/v1/videos/${videoId}/engagement`,
        { credentials: "include", cache: "no-store", headers }
      );
      if (!res.ok) return;
      const json = (await res.json()) as {
        data?: { likesCount?: number; liked?: boolean };
      };
      const lc = json?.data?.likesCount ?? 0;
      const lk = Boolean(json?.data?.liked);
      setLikesCount(lc);
      setLiked(lk);
      snapshotRef.current = { liked: lk, likesCount: lc };
    } catch {
      /* ignore */
    }
  }, [videoId]);

  useEffect(() => {
    void fetchEngagement();
  }, [fetchEngagement]);

  useEffect(() => {
    return () => {
      if (errorClearRef.current) clearTimeout(errorClearRef.current);
    };
  }, []);

  const showError = (message: string) => {
    setActionError(message);
    if (errorClearRef.current) clearTimeout(errorClearRef.current);
    errorClearRef.current = setTimeout(() => setActionError(null), 5000);
  };

  const toggle = async () => {
    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      return;
    }
    if (pending) return;

    setActionError(null);

    const prev = snapshotRef.current;
    const nextLiked = !liked;
    const nextCount = likesCount + (nextLiked ? 1 : -1);

    setPending(true);
    setLiked(nextLiked);
    setLikesCount(Math.max(0, nextCount));
    snapshotRef.current = {
      liked: nextLiked,
      likesCount: Math.max(0, nextCount),
    };

    try {
      if (nextLiked) {
        const res = await fetch(
          `${getApiBaseUrl()}/api/v1/videos/${videoId}/likes`,
          {
            method: "POST",
            credentials: "include",
            headers: { ...auth },
          }
        );
        if (!res.ok) {
          throw new Error("like failed");
        }
      } else {
        const res = await fetch(
          `${getApiBaseUrl()}/api/v1/videos/${videoId}/likes`,
          {
            method: "DELETE",
            credentials: "include",
            headers: { ...auth },
          }
        );
        if (!res.ok) {
          throw new Error("unlike failed");
        }
      }
      await syncEngagement();
    } catch {
      setLiked(prev.liked);
      setLikesCount(prev.likesCount);
      snapshotRef.current = prev;
      showError("Could not update like. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Spinner size="sm" label="Loading likes" />
      </div>
    );
  }

  const authed = "Authorization" in getBearerAuthHeader();

  if (!authed) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Sign in to like videos ({likesCount}{" "}
        {likesCount === 1 ? "like" : "likes"})
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => void toggle()}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
            liked
              ? "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
              : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {pending ? <Spinner size="sm" label="Updating" /> : null}
          {liked ? "Unlike" : "Like"}
          <span className="tabular-nums text-zinc-600 dark:text-zinc-400">
            {likesCount}
          </span>
        </button>
      </div>
      {actionError ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
