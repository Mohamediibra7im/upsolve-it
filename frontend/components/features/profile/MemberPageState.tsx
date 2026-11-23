import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MemberPageStateProps = {
  title: string;
  description?: string;
  kind?: "loading" | "empty" | "error";
  children?: ReactNode;
  className?: string;
};

/** A loading, empty or error state that announces itself to screen readers. */
export default function MemberPageState({
  title,
  description,
  kind = "empty",
  children,
  className,
}: MemberPageStateProps) {
  return (
    <section
      role={
        kind === "error" ? "alert" : kind === "loading" ? "status" : undefined
      }
      className={cn("u-empty", className)}
    >
      <div
        className={cn(
          "u-empty__slots",
          kind === "loading" && "animate-pulse motion-reduce:animate-none",
        )}
        aria-hidden="true"
      >
        <i />
        <i />
        <i />
      </div>
      <h2 className="t-h2">{title}</h2>
      {description && <p className="t-muted max-w-md">{description}</p>}
      {children && (
        <div className="mt-2 flex flex-wrap items-center gap-3">{children}</div>
      )}
    </section>
  );
}
