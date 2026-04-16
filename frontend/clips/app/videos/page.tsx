import { InfiniteVideoFeed } from "@/components/video/InfiniteVideoFeed";

export default function VideosPage() {
  return (
    <main className="min-h-[50vh] w-full flex-1">
      <div className="border-b border-zinc-200 px-4 py-6 dark:border-zinc-800 sm:px-6">
        <h1 className="mx-auto max-w-6xl text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Videos
        </h1>
        <p className="mx-auto mt-1 max-w-6xl text-sm text-zinc-500 dark:text-zinc-400">
          Scroll to load more — paginated from{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
            GET /api/v1/videos?limit=10&amp;skip=…
          </code>
        </p>
      </div>
      <InfiniteVideoFeed />
    </main>
  );
}
