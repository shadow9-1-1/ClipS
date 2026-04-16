import { notFound } from "next/navigation";
import { VideoDetailContent } from "@/components/video/VideoDetailContent";
import { getApiBaseUrl } from "@/lib/api";

export type PublicVideo = {
  id: string;
  title: string;
  description: string;
  videoURL: string;
  duration: number;
  owner?: { id?: string; username?: string };
};

async function fetchVideo(id: string): Promise<PublicVideo | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/v1/videos/${id}`, {
    next: { revalidate: 0 },
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: { video?: PublicVideo } };
  return json?.data?.video ?? null;
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await fetchVideo(id);

  if (!video) {
    notFound();
  }

  return (
    <VideoDetailContent
      video={{
        id: video.id,
        title: video.title,
        description: video.description ?? "",
        videoUrl: video.videoURL,
        duration: video.duration,
      }}
    />
  );
}
