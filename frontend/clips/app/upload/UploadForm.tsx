"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import {
  getApiPrefix,
  getFetchErrorMessage,
  readResponseJson,
} from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";

const MAX_MB = 100;
const MAX_DURATION_MIN = 5;

type UploadSuccess = {
  status?: string;
  message?: string;
  data?: {
    video?: {
      _id?: string;
      id?: string;
      title?: string;
      duration?: number;
    };
  };
};

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<UploadSuccess["data"] | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDone(null);
    const f = e.target.files?.[0];
    setFile(f ?? null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);

    if (!file) {
      setError("Choose an MP4 file first.");
      return;
    }
    if (file.type !== "video/mp4") {
      setError("Only video/mp4 is allowed.");
      return;
    }

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      setError("You must be signed in to upload. Open Sign in and try again.");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("video", file);

      const res = await fetch(`${getApiPrefix()}/v1/videos/upload`, {
        method: "POST",
        credentials: "include",
        headers: auth,
        body,
      });

      const data = await readResponseJson<UploadSuccess>(res);

      if (!res.ok) {
        setError(
          typeof data.message === "string" && data.message.trim()
            ? data.message
            : `Upload failed (${res.status})`
        );
        return;
      }

      setDone(data.data ?? null);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(getFetchErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const v = done?.video;
  const videoId =
    v && v._id != null
      ? String(v._id)
      : v && "id" in v && v.id != null
        ? String((v as { id: string }).id)
        : "";

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        MP4 only, up to {MAX_MB} MB and up to {MAX_DURATION_MIN} minutes. Your file is
        validated on the server (duration and type) before it is stored in MinIO.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
          >
            {error}
          </div>
        ) : null}

        {done?.video ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
          >
            <p className="font-medium">Upload complete</p>
            <p className="mt-1 text-emerald-800/90 dark:text-emerald-200/90">
              {typeof done.video.title === "string" ? done.video.title : "Video"}{" "}
              {typeof done.video.duration === "number"
                ? `(${Math.round(done.video.duration)}s)`
                : null}
            </p>
            {videoId ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href={`/videos/${videoId}`}
                  className="text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-white"
                >
                  View video
                </Link>
                <button
                  type="button"
                  className="text-sm font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-white"
                  onClick={() => {
                    setDone(null);
                    router.push("/videos");
                  }}
                >
                  Back to feed
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="mt-2 text-sm font-medium text-emerald-800 underline dark:text-emerald-200"
                onClick={() => router.push("/videos")}
              >
                Open videos
              </button>
            )}
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="video-file"
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Video file (.mp4)
          </label>
          <input
            ref={inputRef}
            id="video-file"
            name="video"
            type="file"
            accept="video/mp4,.mp4"
            onChange={onPick}
            disabled={loading}
            className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700"
          />
          {file ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Uploading…
            </>
          ) : (
            "Upload video"
          )}
        </button>
      </form>
    </div>
  );
}
