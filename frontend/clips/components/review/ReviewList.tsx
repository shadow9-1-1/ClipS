"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/review/StarRating";
import { getApiBaseUrl } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

export type ReviewItem = {
  id: string;
  username: string;
  rating: number;
  comment: string;
  createdAt?: string;
  /** Shown while POST is in flight */
  pending?: boolean;
};

type ReviewListProps = {
  videoId: string;
  refreshKey?: number;
  /** Optimistic row (prepended until save completes or fails) */
  optimisticReview?: ReviewItem | null;
};

export function ReviewList({
  videoId,
  refreshKey = 0,
  optimisticReview = null,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${getApiBaseUrl()}/api/v1/videos/${videoId}/reviews`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          if (!cancelled) setError("Could not load reviews.");
          return;
        }
        const json = (await res.json()) as {
          data?: { reviews?: ReviewItem[] };
        };
        const list = json?.data?.reviews ?? [];
        if (!cancelled) setReviews(list);
      } catch {
        if (!cancelled) setError("Network error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [videoId, refreshKey]);

  if (loading && !optimisticReview) {
    return (
      <div className="flex justify-center py-8">
        <Spinner label="Loading reviews" />
      </div>
    );
  }

  if (error && !optimisticReview) {
    return (
      <p className="text-center text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  const showEmptyMessage =
    reviews.length === 0 && !optimisticReview;

  if (showEmptyMessage) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        No reviews yet. Be the first to review this video.
      </p>
    );
  }

  const merged: ReviewItem[] = optimisticReview
    ? [
        optimisticReview,
        ...reviews.filter((r) => r.id !== optimisticReview.id),
      ]
    : reviews;

  return (
    <ul className="space-y-4" role="list">
      {merged.map((r) => (
        <li
          key={r.id}
          className={`rounded-xl border p-4 ${
            r.pending
              ? "border-dashed border-amber-300/80 bg-amber-50/50 dark:border-amber-700/60 dark:bg-amber-950/20"
              : "border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {r.username}
              </span>
              {r.pending ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                  Posting…
                </span>
              ) : null}
            </div>
            <StarRating value={r.rating} readOnly label={`${r.rating} stars`} />
          </div>
          {r.comment ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {r.comment}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
