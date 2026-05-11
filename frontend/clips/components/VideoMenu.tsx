"use client";

import { useEffect, useState } from "react";
import { Download, EllipsisVertical, Heart, Share2, Sparkles, ThumbsDown, Flag, Bookmark } from "lucide-react";
import type { Video } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/StarRating";
import { useAuth } from "@/hooks/useAuth";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

type VideoMenuProps = {
  video: Video;
  onOpenShare: () => void;
  onOpenReport: () => void;
};

export function VideoMenu({ video, onOpenShare, onOpenReport }: VideoMenuProps) {
  const [showRating, setShowRating] = useState(false);
  const [resolvedRating, setResolvedRating] = useState(0);
  const { user: authUser } = useAuth();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const saved = useAppStore((state) => Boolean(state.saved[video.id]));
  const toggleSave = useAppStore((state) => state.toggleSave);
  const rating = useAppStore((state) => state.ratings[video.id] ?? 0);
  const rateVideo = useAppStore((state) => state.rateVideo);
  const markNotInterested = useAppStore((state) => state.markNotInterested);

  useEffect(() => {
    if (rating > 0) {
      setResolvedRating(rating);
    }
  }, [rating, video.id]);

  useEffect(() => {
    if (!showRating || rating > 0 || !authUser?.id) return;
    let cancelled = false;

    const loadPreviousRating = async () => {
      try {
        const auth = getBearerAuthHeader();
        const res = await fetch(`${getApiPrefix()}/v1/videos/${video.id}/reviews`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            ...auth,
          },
        });
        if (!res.ok) return;
        const body = (await res.json().catch(() => ({}))) as {
          data?: { reviews?: Array<{ userId?: string; user?: string; rating?: number }> };
        };
        const mine = (body?.data?.reviews ?? []).find(
          (review) => String(review?.userId || review?.user || "") === authUser.id
        );
        const previous = Number(mine?.rating || 0);
        if (!cancelled && Number.isFinite(previous) && previous > 0) {
          setResolvedRating(previous);
        }
      } catch {
        // Keep current local rating value on fetch failure.
      }
    };

    void loadPreviousRating();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id, rating, showRating, video.id]);

  const downloadVideo = async () => {
    const link = document.createElement("a");
    link.href = video.src;
    link.download = `${video.id}.mp4`;
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu onOpenChange={(open) => !open && setShowRating(false)}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="glass inline-flex h-12 w-12 items-center justify-center rounded-full text-foreground transition hover:scale-105"
          aria-label="Open video options"
        >
          <EllipsisVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 border-white/20 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl"
      >
        <DropdownMenuItem
          className="text-slate-100 data-[highlighted]:bg-white/20 data-[highlighted]:text-white"
          onClick={downloadVideo}
        >
          <Download className="h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem
            className={cn(
              "text-slate-100 data-[highlighted]:bg-white/20 data-[highlighted]:text-white",
              saved && "bg-emerald-500/15 text-emerald-100 data-[highlighted]:bg-emerald-500/25 data-[highlighted]:text-emerald-50"
            )}
          onClick={() => toggleSave(video.id)}
        >
            <Bookmark className={cn("h-4 w-4", saved && "fill-emerald-400 text-emerald-400")} />
          {saved ? "Saved" : "Save"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-slate-100 data-[highlighted]:bg-white/20 data-[highlighted]:text-white"
          onClick={onOpenShare}
        >
          <Share2 className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-slate-100 data-[highlighted]:bg-white/20 data-[highlighted]:text-white"
          onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}
        >
          <Sparkles className="h-4 w-4" />
          Auto-scroll {settings.autoScroll ? "on" : "off"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-slate-100 data-[highlighted]:bg-white/20 data-[highlighted]:text-white"
          onSelect={(event) => {
            event.preventDefault();
            setShowRating((value) => !value);
          }}
        >
          <Heart className="h-4 w-4" />
          Rate
        </DropdownMenuItem>
        {showRating ? (
          <>
            <DropdownMenuLabel className="text-slate-300">
              <div className="space-y-1">
                <p>Rate this clip</p>
                <p className="text-xs font-normal normal-case tracking-normal text-slate-400">
                  Current {(resolvedRating || rating || 0).toFixed(1)} · Avg {video.rating.toFixed(1)}
                </p>
              </div>
            </DropdownMenuLabel>
            <div className="px-3 py-2">
              <StarRating
                value={resolvedRating || rating}
                onChange={(value) => {
                  setResolvedRating(value);
                  void rateVideo(video.id, value);
                }}
              />
            </div>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-slate-100 data-[highlighted]:bg-white/20 data-[highlighted]:text-white"
          onClick={() => markNotInterested(video.id)}
        >
          <ThumbsDown className="h-4 w-4" />
          Not interested
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-slate-100 data-[highlighted]:bg-red-500/25 data-[highlighted]:text-red-100"
          onClick={onOpenReport}
        >
          <Flag className="h-4 w-4" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
