function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type VideoPlayerProps = {
  videoUrl: string;
  title: string;
  description: string;
  /** Duration in seconds (used for the on-video overlay label) */
  duration: number;
};

export function VideoPlayer({
  videoUrl,
  title,
  description,
  duration,
}: VideoPlayerProps) {
  const durationLabel = formatDuration(duration);

  return (
    <article className="w-full max-w-4xl">
      <div className="relative w-full overflow-hidden rounded-lg bg-black shadow-md ring-1 ring-zinc-200/80 dark:ring-zinc-800">
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
          className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-medium tabular-nums text-white"
          aria-hidden
        >
          {durationLabel}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 px-0 sm:mt-5 sm:flex-row sm:gap-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50 sm:text-xl">
            {title}
          </h2>
        </div>
        <div className="min-w-0 flex-1 sm:max-w-xl">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}
