import type { HTMLAttributes } from "react";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-11 w-11 border-[3px]",
} as const;

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: keyof typeof sizeMap;
  label?: string;
};

export function Spinner({
  size = "md",
  className = "",
  label = "Loading",
  ...rest
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
      {...rest}
    >
      <span
        className={`animate-spin rounded-full border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-zinc-100 ${sizeMap[size]}`}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
