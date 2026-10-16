import type { ReactNode } from "react";
import { Inbox, Loader2, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdminStateProps = {
  title: string;
  description?: string;
  tone?: "empty" | "loading" | "error";
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function AdminState({
  title,
  description,
  tone = "empty",
  icon,
  action,
  className,
}: AdminStateProps) {
  const Icon =
    icon ??
    (tone === "loading" ? Loader2 : tone === "error" ? TriangleAlert : Inbox);

  return (
    <section
      role={
        tone === "error" ? "alert" : tone === "loading" ? "status" : undefined
      }
      aria-busy={tone === "loading" || undefined}
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-[20px] border border-[#2b3031] bg-[#191c1e] px-6 py-12 text-center font-sans",
        className,
      )}
    >
      <div
        className={cn(
          "mb-5 flex size-12 items-center justify-center rounded-2xl border",
          tone === "error"
            ? "border-[#cb9390]/20 bg-[#cb9390]/5 text-[#cb9390]"
            : "border-[#b5e3c4]/15 bg-[#b5e3c4]/5 text-[#b5e3c4]",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "size-5",
            tone === "loading" && "motion-safe:animate-spin",
          )}
        />
      </div>
      <h2 className="font-heading text-xl font-medium tracking-[-0.035em] text-[#f1f3ee]">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-[#929b98]">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>
      )}
    </section>
  );
}

export function AdminRetry({ onRetry }: { onRetry: () => unknown }) {
  return (
    <Button
      variant="outline"
      className="h-11 rounded-xl border-[#343b37] bg-transparent px-5 text-[#f1f3ee] hover:bg-[#252b27]"
      onClick={() => {
        void onRetry();
      }}
    >
      Try again
    </Button>
  );
}
