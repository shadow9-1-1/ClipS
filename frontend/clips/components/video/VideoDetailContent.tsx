"use client";

import { useState } from "react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { LikeButton } from "@/components/video/LikeButton";
import { ReviewForm } from "@/components/review/ReviewForm";
import { ReviewList, type ReviewItem } from "@/components/review/ReviewList";

type VideoDetailContentProps = {
  video: {
    id: string;
    videoUrl: string;
    title: string;
    description: string;
    duration: number;
  };
};

export function VideoDetailContent({ video }: VideoDetailContentProps) {
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [optimisticReview, setOptimisticReview] = useState<ReviewItem | null>(
    null
  );

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8 sm:px-6">
      <VideoPlayer
        videoUrl={video.videoUrl}
        title={video.title}
        description={video.description}
        duration={video.duration}
      />

      <div className="mt-10 space-y-8">
        <section>
          <h3 className="mb-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Likes
          </h3>
          <LikeButton videoId={video.id} />
        </section>

        <ReviewForm
          videoId={video.id}
          onOptimisticChange={setOptimisticReview}
          onRefresh={() => setReviewRefresh((k) => k + 1)}
        />

        <section>
          <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Reviews
          </h3>
          <ReviewList
            videoId={video.id}
            refreshKey={reviewRefresh}
            optimisticReview={optimisticReview}
          />
        </section>
      </div>
    </main>
  );
}
