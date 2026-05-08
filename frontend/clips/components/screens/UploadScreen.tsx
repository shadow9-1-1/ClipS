"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Film, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { getApiPrefix } from "@/lib/api";
import { getBearerAuthHeader } from "@/lib/auth-headers";
import { mapApiVideoToUi } from "@/lib/backend-adapters";

function buildPoster(label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07111f"/>
          <stop offset="100%" stop-color="#123d63"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#g)"/>
      <circle cx="840" cy="300" r="260" fill="#22d3ee" fill-opacity="0.25"/>
      <text x="80" y="1480" fill="white" font-family="Inter, Arial, sans-serif" font-size="88" font-weight="700">${label}</text>
      <text x="80" y="1558" fill="white" fill-opacity="0.7" font-family="Inter, Arial, sans-serif" font-size="32">ClipS upload preview</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function UploadScreen() {
  const addVideo = useAppStore((state) => state.addVideo);
  const setError = useAppStore((state) => state.setError);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [music, setMusic] = useState("");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const submit = async () => {
    if (!file || !preview) {
      setError({ title: "Missing video", message: "Choose a clip before uploading." });
      return;
    }

    const text = caption.trim();
    if (!text) {
      setError({ title: "Caption required", message: "Add a caption before sharing the clip." });
      return;
    }

    const auth = getBearerAuthHeader();
    if (!("Authorization" in auth)) {
      setError({ title: "Sign in required", message: "Please sign in to upload." });
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("video", file);

      const res = await fetch(`${getApiPrefix()}/v1/videos/upload`, {
        method: "POST",
        headers: { ...auth },
        body: form,
        credentials: "include",
      });

      const body = (await res.json().catch(() => ({}))) as {
        data?: { video?: any; file?: { accessUrl?: string } };
        message?: string;
      };

      if (!res.ok) {
        throw new Error(body?.message || "Upload failed");
      }

      const apiVideo = body?.data?.video || {};
      const accessUrl = body?.data?.file?.accessUrl;
      const mapped = mapApiVideoToUi(apiVideo);
      addVideo({
        ...mapped,
        caption: text,
        music: music.trim() || "Original audio",
        tags: text.split(/\s+/).filter(Boolean).slice(0, 3).map((tag) => `#${tag.replace(/[^a-z0-9]/gi, "").toLowerCase()}`),
        src: accessUrl || mapped.src,
        poster: accessUrl || mapped.poster || buildPoster("Uploaded clip"),
      });

      setSubmitting(false);
      toast.success("Clip uploaded");
      router.push("/profile");
    } catch (err) {
      setSubmitting(false);
      setError({ title: "Upload failed", message: err instanceof Error ? err.message : "Upload failed." });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="glass rounded-[2.5rem] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Upload</p>
            <h1 className="text-3xl font-semibold tracking-tight">Drop a clip and build the post.</h1>
          </div>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            const nextFile = event.dataTransfer.files[0];
            if (nextFile) setFile(nextFile);
          }}
          className={`mt-6 rounded-[2.5rem] border-2 border-dashed p-10 text-center transition ${dragActive ? "border-primary bg-primary/10" : "border-border bg-white/5"}`}
        >
          <Film className="mx-auto h-12 w-12 text-primary" />
          <p className="mt-4 text-lg font-semibold">Drag and drop a video here</p>
          <p className="mt-2 text-sm text-muted-foreground">or choose a file from your device. The preview is generated locally.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]"
          >
            <Camera className="h-4 w-4" />
            Browse files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span>Caption</span>
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={4}
              placeholder="Describe the clip, the mood, or the edit."
              className="w-full rounded-3xl border border-border bg-background/80 px-4 py-3 outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Music</span>
            <input
              value={music}
              onChange={(event) => setMusic(event.target.value)}
              placeholder="Track name or original audio"
              className="h-12 w-full rounded-full border border-border bg-background/80 px-4 outline-none placeholder:text-muted-foreground"
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Orientation</span>
            <select
              value={orientation}
              onChange={(event) => setOrientation(event.target.value as "portrait" | "landscape")}
              className="h-12 w-full rounded-full border border-border bg-background/80 px-4 outline-none"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish clip"}
        </button>
      </section>

      <aside className="space-y-4">
        <div className="glass rounded-[2.5rem] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Preview</p>
          <div className="mt-4 overflow-hidden rounded-[2rem] border border-border bg-black shadow-soft">
            {preview ? (
              <video src={preview} controls className="h-[30rem] w-full object-cover" />
            ) : (
              <div className="flex h-[30rem] items-center justify-center bg-gradient-to-br from-primary/10 via-white/5 to-accent/10 text-sm text-muted-foreground">
                Your clip preview appears here.
              </div>
            )}
          </div>
        </div>
        <div className="glass rounded-[2.5rem] p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Upload flow</p>
          <ul className="mt-3 space-y-2">
            <li>• Mock upload only. No backend, no network APIs.</li>
            <li>• Preview uses <span className="text-foreground">URL.createObjectURL</span>.</li>
            <li>• Successful submit redirects to your profile.</li>
          </ul>
        </div>
      </aside>
    </motion.div>
  );
}
