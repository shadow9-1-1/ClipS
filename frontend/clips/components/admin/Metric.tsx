import type { ReactNode } from "react";

type MetricProps = {
  value: ReactNode;
  subtitle?: string;
  delta?: number | null;
};

export function Metric({ value, subtitle, delta = null }: MetricProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">{value}</div>
        {subtitle ? (
          <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</div>
        ) : null}
      </div>

      {typeof delta === "number" && (
        <div className="ml-4 flex items-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              delta > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default Metric;
