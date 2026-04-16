"use client";

import { useState } from "react";
import { useIsOwner } from "@/hooks/useIsOwner";

type ReviewOwnerActionsProps = {
  /** Review author id (from API `userId`) */
  authorUserId: string | null | undefined;
};

/**
 * Edit / Delete for a review row. Visibility only when `authorUserId` matches the logged-in user.
 * (Wire handlers to PATCH/DELETE routes when available in the API.)
 */
export function ReviewOwnerActions({ authorUserId }: ReviewOwnerActionsProps) {
  const isOwner = useIsOwner(authorUserId);
  const [hint, setHint] = useState<string | null>(null);

  if (!isOwner) {
    return null;
  }

  return (
    <div className="mt-3 space-y-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
          onClick={() =>
            setHint("Review editing is not available in this build yet.")
          }
        >
          Edit
        </button>
        <button
          type="button"
          className="text-sm font-medium text-red-600 underline-offset-2 hover:text-red-700 hover:underline dark:text-red-400"
          onClick={() =>
            setHint("Review deletion is not available in this build yet.")
          }
        >
          Delete
        </button>
      </div>
      {hint ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
