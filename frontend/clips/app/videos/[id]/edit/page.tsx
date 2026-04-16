import Link from "next/link";

/** Placeholder for Phase 2 — wire to an edit form when ready */
export default async function EditVideoPlaceholderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Edit video
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Video ID: <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">{id}</code>
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This route is linked from the owner &quot;Edit&quot; action. Replace with
        your update form (title, description, etc.).
      </p>
      <Link
        href={`/videos/${id}`}
        className="mt-6 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
      >
        ← Back to video
      </Link>
    </main>
  );
}
