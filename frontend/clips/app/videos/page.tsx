import { InfiniteVideoFeed } from "@/components/video/InfiniteVideoFeed";

export default function VideosPage() {
  return (
    <main className="min-h-[50vh] w-full flex-1">
      <div className="border-b border-zinc-200 px-4 py-6 dark:border-zinc-800 sm:px-6">
        <h1 className="mx-auto max-w-6xl text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Videos
        </h1>
      </div>
      <InfiniteVideoFeed />
    </main>
  );
}
