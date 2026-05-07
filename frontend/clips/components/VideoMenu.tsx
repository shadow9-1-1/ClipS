"use client";

import { Download, EllipsisVertical, Heart, Share2, Sparkles, ThumbsDown, Flag } from "lucide-react";
import type { Video } from "@/data/mock";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StarRating } from "@/components/StarRating";

type VideoMenuProps = {
  video: Video;
  onOpenShare: () => void;
  onOpenReport: () => void;
};

export function VideoMenu({ video, onOpenShare, onOpenReport }: VideoMenuProps) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="glass inline-flex h-12 w-12 items-center justify-center rounded-full text-foreground transition hover:scale-105"
          aria-label="Open video options"
        >
          <EllipsisVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={downloadVideo}>
          <Download className="h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleSave(video.id)}>
          <Heart className={cn("h-4 w-4", saved && "fill-primary text-primary")} />
          {saved ? "Saved" : "Save"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenShare}>
          <Share2 className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}>
          <Sparkles className="h-4 w-4" />
          Auto-scroll {settings.autoScroll ? "on" : "off"}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Heart className="h-4 w-4" />
            Rate
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-72">
            <DropdownMenuLabel>
              <div className="space-y-1">
                <p>Rate this clip</p>
                <p className="text-xs font-normal normal-case tracking-normal text-muted-foreground">
                  Current {rating || video.rating.toFixed(1)} · Avg {video.rating.toFixed(1)}
                </p>
              </div>
            </DropdownMenuLabel>
            <div className="px-3 py-2">
              <StarRating value={rating} onChange={(value) => rateVideo(video.id, value)} />
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => markNotInterested(video.id)}>
          <ThumbsDown className="h-4 w-4" />
          Not interested
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenReport}>
          <Flag className="h-4 w-4" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
