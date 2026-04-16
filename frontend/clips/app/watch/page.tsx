import { VideoPlayer } from "@/components/video/VideoPlayer";

/**
 * Example: render the player on a detail or feed page.
 * Use `videoUrl` from your API (presigned MinIO URL, storage proxy, etc.).
 */
export default function WatchExamplePage() {
  return (
    <main className="flex min-h-[60vh] w-full flex-1 flex-col items-center px-4 py-10 sm:px-6">
      <VideoPlayer
        videoUrl="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        title="Sample clip"
        description="Phase 2 layout: centered column, native controls, duration overlay, and muted description text below."
        duration={6}
      />
    </main>
  );
}
