import { cn } from "@/lib/utils";
import StudioMascot from "./StudioMascot";
import Brand from "@/components/layout/Brand";

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}
export default function Loader({
  fullScreen = true,
  message = "Loading your space…",
  size = "md",
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-7 bg-background px-6 font-sans",
        fullScreen ? "min-h-dvh" : "py-16",
      )}
    >
      <Brand />
      <StudioMascot pose="rest" className="w-28" />
      <div className="w-40 space-y-2" aria-hidden="true">
        <div className="h-1.5 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="mx-auto h-1.5 w-24 animate-pulse rounded-full bg-muted/60 motion-reduce:animate-none" />
      </div>
      <p
        className={cn(
          "text-center font-medium text-muted-foreground",
          size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {message}
      </p>
    </div>
  );
}
