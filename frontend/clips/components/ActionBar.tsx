"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck, MessageSquare, Plus, Heart } from "lucide-react";
import type { User, Video } from "@/data/mock";
import { cn } from "@/lib/utils";
import { VideoMenu } from "@/components/VideoMenu";

type ActionBarProps = {
  video: Video;
  creator: User;
  liked: boolean;
  following: boolean;
  onLike: () => void;
  onComments: () => void;
  onToggleFollow: () => void;
  onOpenShare: () => void;
  onOpenReport: () => void;
};

export function ActionBar({ video, creator, liked, following, onLike, onComments, onToggleFollow, onOpenShare, onOpenReport }: ActionBarProps) {
  return (
    <div className="pointer-events-auto flex h-full flex-col items-center justify-end gap-4 pb-3">
      <Link
        href={`/profile/${creator.username}`}
        className="group flex flex-col items-center gap-2 text-center"
        aria-label={`Open ${creator.displayName}'s profile`}
      >
        <div className="relative">
          <img
            src={creator.avatar}
            alt={creator.displayName}
            className="h-14 w-14 rounded-2xl border border-white/10 object-cover shadow-soft transition group-hover:scale-105"
          />
          {creator.verified ? (
            <span className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-primary-foreground shadow-soft">
              <BadgeCheck className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
        <span className="max-w-[4.5rem] truncate text-xs font-medium text-white/90">@{creator.username}</span>
      </Link>

      <motion.button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleFollow();
        }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold backdrop-blur-sm transition",
          following ? "bg-white/15 text-white" : "bg-primary text-primary-foreground"
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        {following ? "Following" : "Follow"}
      </motion.button>

      <motion.button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onLike();
        }}
        whileTap={{ scale: 0.92 }}
        className="flex flex-col items-center gap-1 text-white/90 transition hover:text-primary"
        aria-label={liked ? "Unlike video" : "Like video"}
      >
        <span className={cn("flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition", liked && "bg-primary/20 text-primary") }>
          <Heart className={cn("h-7 w-7", liked && "fill-primary text-primary")} />
        </span>
        <span className="text-xs font-medium tabular-nums">{video.likes.toLocaleString()}</span>
      </motion.button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onComments();
        }}
        className="flex flex-col items-center gap-1 text-white/90 transition hover:text-primary"
        aria-label="Open comments"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition hover:scale-105">
          <MessageSquare className="h-6 w-6" />
        </span>
        <span className="text-xs font-medium tabular-nums">{video.commentCount.toLocaleString()}</span>
      </button>

      <VideoMenu
        video={video}
        onOpenShare={onOpenShare}
        onOpenReport={onOpenReport}
      />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 10, ease: "linear" }}
        className="mt-2 h-14 w-14 rounded-full border border-white/10 bg-gradient-to-br from-primary/70 via-accent/60 to-white/20 p-1.5 shadow-soft"
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-background/80 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
          Track
        </div>
      </motion.div>
    </div>
  );
}
