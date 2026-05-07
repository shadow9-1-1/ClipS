type HealthBadgeProps = {
  status: "online" | "offline" | "unknown";
  label?: string;
};

export function HealthBadge({ status, label }: HealthBadgeProps) {
  const color = status === "online" ? "bg-emerald-500" : status === "offline" ? "bg-red-500" : "bg-zinc-400";
  const text = status === "online" ? "Online" : status === "offline" ? "Offline" : "Unknown";
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`${color} inline-block h-2 w-2 rounded-full`} aria-hidden="true" />
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{label ?? text}</span>
    </div>
  );
}

export default HealthBadge;
