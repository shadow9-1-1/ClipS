"use client";

import type { ReactNode } from "react";
import { formatDuration } from "@/components/video/VideoPlayer";
import { VideoOwnerActions } from "@/components/video/VideoOwnerActions";

export type VideoGridItem = {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  duration: number;
  ownerId?: string;
};

export type VideoGridProps = {
  videos: VideoGridItem[];
  /** Rendered below the grid (e.g. infinite-scroll sentinel) */
  footer?: ReactNode;
};

function VideoGridCard({ item }: { item: VideoGridItem }) {
  const durationLabel = formatDuration(item.duration);

  return (
    <li className="min-w-0">
      <article className="flex h-full flex-col overflow-hidden rounded-xl bg-zinc-50 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="relative aspect-video w-full bg-black">
          <video
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            src={item.videoUrl}
          >
            Your browser does not support the video tag.
          </video>
          <div
            className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium tabular-nums text-white"
            aria-hidden
          >
            {durationLabel}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-3 sm:p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            {item.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {item.description}
          </p>
          <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
            <VideoOwnerActions videoId={item.id} ownerId={item.ownerId} />
          </div>
        </div>
      </article>
    </li>
  );
}

export function VideoGrid({ videos, footer }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          No videos found
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <ul
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="list"
      >
        {videos.map((item) => (
          <VideoGridCard key={item.id} item={item} />
        ))}
      </ul>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </div>
  );
}
