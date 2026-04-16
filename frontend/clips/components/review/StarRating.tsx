"use client";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  label?: string;
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  label = "Rating",
}: StarRatingProps) {
  const levels = [1, 2, 3, 4, 5] as const;

  return (
    <div
      className="flex flex-col gap-1"
      role={readOnly ? undefined : "radiogroup"}
      aria-label={label}
    >
      {!readOnly ? (
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      ) : null}
      <div
        className="flex items-center gap-0.5"
        aria-label={readOnly ? `${value} out of 5 stars` : undefined}
      >
        {levels.map((n) => {
          const active = n <= value;
          const cls = `text-2xl leading-none ${
            active ? "text-amber-400" : "text-zinc-300 dark:text-zinc-600"
          }`;
          if (readOnly) {
            return (
              <span key={n} className={cls} aria-hidden>
                ★
              </span>
            );
          }
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(n)}
              className={`rounded p-0.5 transition ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-105"
              } ${cls}`}
              aria-checked={value === n}
              role="radio"
            >
              <span aria-hidden>★</span>
              <span className="sr-only">
                {n} {n === 1 ? "star" : "stars"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
