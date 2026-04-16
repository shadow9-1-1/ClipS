import { VideoPlayer } from "@/components/video/VideoPlayer";

/**
 * Example page: pass a URL from your API (e.g. MinIO presigned URL or `/api/v1/...` proxy).
 * Sample asset below is a small public-domain clip for local testing only.
 */
export default function WatchExamplePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Video example
      </h1>
      <VideoPlayer
        videoUrl="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        title="Sample clip (MDN)"
        description="Minimal HTML5 video player with title, description, and a duration badge. Replace the URL with your Phase 2 video URL from storage or the backend."
        duration={6}
      />
    </main>
  );
}
