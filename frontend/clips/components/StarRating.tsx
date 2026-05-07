"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const active = value >= starValue;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange?.(starValue)}
            className={cn(
              "rounded-full transition hover:scale-110",
              onChange ? "cursor-pointer" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                active ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
