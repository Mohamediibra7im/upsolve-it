import { cn } from "@/lib/utils";

export default function StudioProgress({ value, label = "Progress", className }: { value: number; label?: string; className?: string }) {
  const progress = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} className={cn("block h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
    </span>
  );
}
