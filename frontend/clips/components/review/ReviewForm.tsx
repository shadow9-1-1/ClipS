"use client";

import { useState } from "react";
import { StarRating } from "@/components/review/StarRating";
import type { ReviewItem } from "@/components/review/ReviewList";
import { getApiBaseUrl } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

type ReviewFormProps = {
  videoId: string;
  /** Called with optimistic row, then `null` when resolved or reverted */
  onOptimisticChange: (review: ReviewItem | null) => void;
  /** Bump after successful save so the list refetches server data */
  onRefresh: () => void;
};

export function ReviewForm({
  videoId,
  onOptimisticChange,
  onRefresh,
}: ReviewFormProps) {
  const { user } = useAuth();
  const displayName = user?.username?.trim() || "You";

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSuccess(null);

    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      setError("Sign in to submit a review.");
      return;
    }

    const tempId = `pending-${Date.now()}`;
    const optimistic: ReviewItem = {
      id: tempId,
      username: displayName,
      rating,
      comment: comment.trim(),
      pending: true,
    };

    const backup = { rating, comment: comment.trim() };

    setRating(0);
    setComment("");
    onOptimisticChange(optimistic);

    setLoading(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/v1/videos/${videoId}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...auth,
          },
          body: JSON.stringify({
            rating: backup.rating,
            comment: backup.comment,
          }),
        }
      );

      const body = (await res.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!res.ok) {
        onOptimisticChange(null);
        setRating(backup.rating);
        setComment(backup.comment);
        setError(body?.message ?? `Could not submit review (${res.status})`);
        return;
      }

      onOptimisticChange(null);
      onRefresh();
      setSuccess("Review posted.");
    } catch {
      onOptimisticChange(null);
      setRating(backup.rating);
      setComment(backup.comment);
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Write a review
      </h3>
      <div className="mt-3 space-y-3">
        <StarRating value={rating} onChange={setRating} disabled={loading} />
        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Comment
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            rows={3}
            placeholder="Share your thoughts…"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-600"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {success}
          </p>
        ) : null}
        <button
          type="button"
          disabled={loading}
          onClick={() => void submit()}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? <Spinner size="sm" label="Submitting" /> : null}
          Submit review
        </button>
      </div>
    </section>
  );
}
