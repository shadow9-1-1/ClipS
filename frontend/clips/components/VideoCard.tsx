"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock3, Music2, Hash } from "lucide-react";
import Link from "next/link";
import type { Video } from "@/data/mock";
import { getUser } from "@/data/mock";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ActionBar } from "@/components/ActionBar";
import { CommentsDrawer } from "@/components/CommentsDrawer";
import { ShareDialog } from "@/components/ShareDialog";
import { ReportDialog } from "@/components/ReportDialog";

type VideoCardProps = {
  video: Video;
  active: boolean;
  onRemove?: () => void;
  compact?: boolean;
};

export function VideoCard({ video, active, onRemove, compact }: VideoCardProps) {
  const creator = getUser(video.userId);
  const liked = useAppStore((state) => Boolean(state.liked[video.id]));
  const following = useAppStore((state) => Boolean(state.following[video.userId]));
  const setLiked = useAppStore((state) => state.setLiked);
  const toggleFollow = useAppStore((state) => state.toggleFollow);
  const notInterested = useAppStore((state) => Boolean(state.notInterested[video.id]));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const stats = useMemo(() => {
    return [
      { label: `${video.rating.toFixed(1)}`, value: "rating" },
      { label: `${video.saves.toLocaleString()}`, value: "saves" },
    ];
  }, [video.rating, video.saves]);

  if (notInterested) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
      className={cn(
        "snap-item relative h-dvh w-full overflow-hidden border border-border/70 bg-card shadow-soft",
        compact ? "rounded-[2rem]" : "rounded-[2.25rem]"
      )}
    >
      <VideoPlayer
        video={video}
        active={active}
        onDoubleTapLike={() => setLiked(video.id, true)}
      />

      <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-between gap-4 p-4 sm:p-6 md:p-8">
        <div className="pointer-events-auto max-w-2xl space-y-3 pb-2 pr-16 md:pr-0">
          <Link href={`/profile/${creator.username}`} className="inline-flex items-center gap-3 text-sm text-white/80" aria-label={`Open ${creator.displayName}'s profile`}>
            <img src={creator.avatar} alt={creator.displayName} className="h-11 w-11 rounded-2xl border border-white/10 object-cover" />
            <div>
              <div className="flex items-center gap-2 text-white">
                <span className="font-semibold">{creator.displayName}</span>
                {creator.verified ? <BadgeCheck className="h-4 w-4 text-primary" /> : null}
              </div>
              <p className="text-xs text-white/65">@{creator.username}</p>
            </div>
          </Link>

          <div className="glass group/info max-w-2xl rounded-[2rem] p-5 text-sm leading-relaxed text-white/90 transition-all duration-300 ease-out md:max-w-[22rem] md:p-4 md:hover:max-w-2xl md:hover:p-5">
            <p className="text-base font-medium text-white transition-all duration-300 md:line-clamp-2 md:group-hover/info:line-clamp-none">{video.caption}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-white/70 transition-all duration-300 md:max-h-0 md:translate-y-1 md:overflow-hidden md:opacity-0 md:group-hover/info:max-h-24 md:group-hover/info:translate-y-0 md:group-hover/info:opacity-100">
              {video.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
                  <Hash className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/70 transition-all duration-300 md:max-h-0 md:translate-y-1 md:overflow-hidden md:opacity-0 md:group-hover/info:max-h-24 md:group-hover/info:translate-y-0 md:group-hover/info:opacity-100">
              <span className="inline-flex items-center gap-1">
                <Music2 className="h-3.5 w-3.5 text-primary" />
                {video.music}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5 text-primary" />
                {video.duration}s
              </span>
              {stats.map((stat) => (
                <span key={stat.value} className="rounded-full bg-white/10 px-3 py-1.5">
                  {stat.label} {stat.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-auto pb-10 md:pb-4">
          <ActionBar
            video={video}
            creator={creator}
            liked={liked}
            following={following}
            onLike={() => setLiked(video.id, !liked)}
            onComments={() => setCommentsOpen(true)}
            onToggleFollow={() => toggleFollow(video.userId)}
            onOpenShare={() => setShareOpen(true)}
            onOpenReport={() => setReportOpen(true)}
          />
        </div>
      </div>

      <CommentsDrawer open={commentsOpen} onOpenChange={setCommentsOpen} videoId={video.id} />
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} video={video} />
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} video={video} />
    </motion.article>
  );
}
