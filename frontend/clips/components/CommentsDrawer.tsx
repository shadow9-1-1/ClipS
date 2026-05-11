"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, MessageCircleMore, Send } from "lucide-react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { StarRating } from "@/components/review/StarRating";

type CommentsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
};

type ReviewItem = {
  id: string;
  username: string;
  comment: string;
  rating: number;
  likes?: number;
};

export function CommentsDrawer({ open, onOpenChange, videoId }: CommentsDrawerProps) {
  const [comments, setComments] = useState<ReviewItem[]>([]);
  const [draft, setDraft] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localLikes, setLocalLikes] = useState<Record<string, boolean>>({});

  const visibleComments = useMemo(() => comments, [comments]);
  const canPost = draft.trim().length > 0;

  const loadReviews = async () => {
    const res = await fetch(
      `${getApiPrefix()}/v1/videos/${videoId}/reviews`,
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const json = (await res.json()) as { data?: { reviews?: any[] } };
    const list = (json?.data?.reviews ?? []).map((review) => ({
      id: String(review.id || review._id || ""),
      username: review.username || "User",
      comment: review.comment || "",
      rating: Number(review.rating || 0),
    }));
    setComments(list);
  };

  useEffect(() => {
    let cancelled = false;
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        await loadReviews();
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, videoId]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    if (rating < 1) {
      toast.error("Select a rating before posting.");
      return;
    }

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      toast.error("Sign in to post a review.");
      return;
    }

    try {
      const res = await fetch(
        `${getApiPrefix()}/v1/videos/${videoId}/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...auth,
          },
          body: JSON.stringify({ rating, comment: text }),
        }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        toast.error(body?.message || "Could not add comment.");
        return;
      }

      setDraft("");
      setRating(0);
      toast.success("Comment posted");
      await loadReviews();
    } catch {
      toast.error("Network error. Try again.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-hidden md:mx-auto md:max-w-3xl md:rounded-t-[2rem]">
        <DrawerHeader className="mb-3 border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="flex items-center gap-2 text-slate-50">
                <MessageCircleMore className="h-5 w-5 text-primary" />
                Comments
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-slate-300">
                {visibleComments.length.toLocaleString()} replies on this clip
              </DrawerDescription>
            </div>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
              Live thread
            </span>
          </div>
        </DrawerHeader>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1 no-scrollbar">
          {visibleComments.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-slate-300">
              No comments yet. Be the first to start the conversation.
            </div>
          ) : (
            visibleComments.map((comment) => {
              const liked = Boolean(localLikes[comment.id]);
              return (
                <div key={comment.id} className="group flex items-start gap-3 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 to-slate-900/70 p-4 transition hover:border-white/20 hover:bg-slate-900/95">
                  <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-50">{comment.username}</span>
                      {comment.rating ? (
                        <span className="text-xs text-slate-300">{comment.rating}★</span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-100">{comment.comment}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                      <button
                        type="button"
                        onClick={() => setLocalLikes((current) => ({ ...current, [comment.id]: !current[comment.id] }))}
                        className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-white/10", liked && "text-red-400")}
                      >
                        <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
                        {(comment.likes ?? 0 + (liked ? 1 : 0)).toLocaleString()}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 border-t border-white/15 pt-4">
          <div className="flex items-end gap-3 rounded-3xl border border-white/15 bg-slate-900/90 p-3">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 300))}
              placeholder="Write a comment..."
              maxLength={300}
              className="min-h-20 flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
            />
            <div className="flex flex-col items-end gap-2">
              <StarRating value={rating} onChange={setRating} />
              <button
                type="button"
                onClick={submit}
                disabled={!canPost}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Post
              </button>
            </div>
          </div>
          <div className="mt-2 text-right text-xs text-slate-400">{draft.length}/300</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
