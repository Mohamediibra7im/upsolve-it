import { cn } from "@/lib/utils";
import Brand from "@/components/layout/Brand";

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  /** Kept for callers; the loader has one size. */
  size?: "sm" | "md" | "lg";
}

export default function Loader({
  fullScreen = true,
  message = "Loading your practice…",
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-6 px-6",
        fullScreen ? "min-h-dvh" : "py-16",
      )}
    >
      {fullScreen && <Brand />}
      <div
        className="u-empty__slots animate-pulse motion-reduce:animate-none"
        aria-hidden="true"
      >
        <i />
        <i />
        <i />
      </div>
      <p className="t-sm t-muted text-center">{message}</p>
    </div>
  );
}
