"use client";

import type { NormalizedApiError } from "@/lib/parse-api-error";
import { Modal } from "./Modal";

export type ErrorModalProps = {
  open: boolean;
  onClose: () => void;
  error: NormalizedApiError | null;
  dismissLabel?: string;
};

export function ErrorModal({
  open,
  onClose,
  error,
  dismissLabel = "Dismiss",
}: ErrorModalProps) {
  if (!open || !error) return null;

  const hint =
    error.statusCode === 401
      ? "Sign in again or check that your session cookie is sent with requests."
      : error.statusCode && error.statusCode >= 500
        ? "The server had a problem. You can try again in a moment."
        : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={error.title}
      size="md"
      footer={
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          onClick={onClose}
        >
          {dismissLabel}
        </button>
      }
    >
      <p className="leading-relaxed">{error.message}</p>
      {hint ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
      {error.statusCode ? (
        <p className="mt-2 font-mono text-xs text-zinc-400">
          HTTP {error.statusCode}
        </p>
      ) : null}
    </Modal>
  );
}
