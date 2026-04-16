import { VideoGrid, type VideoGridItem } from "@/components/video/VideoGrid";

const SAMPLE: VideoGridItem[] = [
  {
    id: "1",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    title: "Flower sample",
    description: "Short CC0 clip for layout testing.",
    duration: 6,
  },
  {
    id: "2",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    title: "Another row (same asset)",
    description: "Grid maps multiple items; swap URLs from your API.",
    duration: 6,
  },
  {
    id: "3",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    title: "Third card",
    description: "Responsive columns: 1 · 2 · 3 · 4 by breakpoint.",
    duration: 6,
  },
  {
    id: "4",
    videoUrl:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    title: "Fourth card",
    description: "max-w-6xl container with gap-6 spacing.",
    duration: 6,
  },
];

export default function VideosPage() {
  return (
    <main className="min-h-[50vh] w-full flex-1">
      <div className="border-b border-zinc-200 px-4 py-6 dark:border-zinc-800 sm:px-6">
        <h1 className="mx-auto max-w-6xl text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Videos
        </h1>
      </div>
      <VideoGrid videos={SAMPLE} />
    </main>
  );
}
