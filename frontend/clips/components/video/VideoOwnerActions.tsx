"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsOwner } from "@/hooks/useIsOwner";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

type VideoOwnerActionsProps = {
  videoId: string;
  ownerId: string | null | undefined;
};

export function VideoOwnerActions({ videoId, ownerId }: VideoOwnerActionsProps) {
  const isOwner = useIsOwner(ownerId);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) {
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this video permanently?")) return;
    setError(null);
    setBusy(true);
    try {
      const auth = getBearerAuthHeader();
      if (!("Authorization" in auth)) {
        setError("You must be signed in.");
        return;
      }
      const res = await fetch(`${getApiPrefix()}/v1/videos/${videoId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { ...auth },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        setError(body?.message ?? "Could not delete video.");
        return;
      }
      router.push("/videos");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/videos/${videoId}/edit`}
        className="inline-flex min-h-9 items-center rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Edit
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleDelete()}
        className="inline-flex min-h-9 items-center rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-950/40"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      {error ? (
        <p className="w-full text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
