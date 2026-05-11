"use client";

import { useState } from "react";
import { Download, EllipsisVertical, Heart, Share2, Sparkles, ThumbsDown, Flag } from "lucide-react";
import type { Video } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/StarRating";

type VideoMenuProps = {
  video: Video;
  onOpenShare: () => void;
  onOpenReport: () => void;
};

export function VideoMenu({ video, onOpenShare, onOpenReport }: VideoMenuProps) {
  const [showRating, setShowRating] = useState(false);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const saved = useAppStore((state) => Boolean(state.saved[video.id]));
  const toggleSave = useAppStore((state) => state.toggleSave);
  const rating = useAppStore((state) => state.ratings[video.id] ?? 0);
  const rateVideo = useAppStore((state) => state.rateVideo);
  const markNotInterested = useAppStore((state) => state.markNotInterested);

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
            <Heart className={cn("h-4 w-4", saved && "fill-emerald-400 text-emerald-400")} />
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
                  Current {rating || video.rating.toFixed(1)} · Avg {video.rating.toFixed(1)}
                </p>
              </div>
            </DropdownMenuLabel>
            <div className="px-3 py-2">
              <StarRating value={rating} onChange={(value) => { void rateVideo(video.id, value); }} />
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
