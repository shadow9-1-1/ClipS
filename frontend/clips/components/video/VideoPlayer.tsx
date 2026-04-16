import type { ReactNode } from "react";

/**
 * Formats a duration in seconds as `m:mm` / `mm:ss` (always minutes:seconds).
 */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type VideoPlayerProps = {
  videoUrl: string;
  title: string;
  description: string;
  /** Duration in seconds (shown in the bottom-right overlay as mm:ss) */
  duration: number;
  /** Owner-only actions (e.g. Edit / Delete), rendered below the description */
  ownerActions?: ReactNode;
};

export function VideoPlayer({
  videoUrl,
  title,
  description,
  duration,
  ownerActions,
}: VideoPlayerProps) {
  const durationLabel = formatDuration(duration);

  return (
    <article className="mx-auto w-full max-w-lg">
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-md ring-1 ring-zinc-900/10 dark:ring-white/10">
        <div className="aspect-video w-full">
          <video
            className="h-full w-full object-contain"
            controls
            playsInline
            preload="metadata"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div
          className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-xs font-medium tabular-nums text-white"
          aria-hidden
        >
          {durationLabel}
        </div>
      </div>

      <h2 className="mt-4 text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {ownerActions ? <div className="mt-4">{ownerActions}</div> : null}
    </article>
  );
}
