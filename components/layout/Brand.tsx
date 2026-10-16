import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("size-10 shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" fill="#b5e3c4" />
      <path
        d="M10 12v12a7 7 0 0 0 14 0V10"
        stroke="#183123"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m18 16 6-6 6 6"
        stroke="#183123"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark className="size-8" />
      {!compact && (
        <span className="font-heading text-[21px] font-semibold leading-none tracking-[-0.065em] text-foreground">
          upsolve<span className="font-medium text-primary">.it</span>
        </span>
      )}
    </span>
  );
}
