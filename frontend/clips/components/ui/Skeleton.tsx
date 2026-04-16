import type { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  rounded?: "sm" | "md" | "lg" | "full";
};

const roundMap = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
} as const;

export function Skeleton({
  className = "",
  rounded = "md",
  ...rest
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-zinc-200/90 dark:bg-zinc-800 ${roundMap[rounded]} ${className}`}
      aria-hidden
      {...rest}
    />
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <Skeleton className="h-16 w-24 shrink-0" rounded="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/5 max-w-[12rem]" rounded="sm" />
        <Skeleton className="h-3 w-full max-w-[18rem]" rounded="sm" />
        <Skeleton className="h-3 w-1/3 max-w-[6rem]" rounded="sm" />
      </div>
    </div>
  );
}

export function VideoListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading videos">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
