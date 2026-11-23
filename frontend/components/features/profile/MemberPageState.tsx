import type { ReactNode } from "react";
import { CircleAlert, Compass, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type MemberPageStateProps = {
  title: string;
  description?: string;
  kind?: "loading" | "empty" | "error";
  children?: ReactNode;
  className?: string;
};

/** A consistent, readable state for the member workspace. */
export default function MemberPageState({ title, description, kind = "empty", children, className }: MemberPageStateProps) {
  const Icon = kind === "loading" ? LoaderCircle : kind === "error" ? CircleAlert : Compass;
  return (
    <section role={kind === "error" ? "alert" : kind === "loading" ? "status" : undefined} className={cn("flex min-h-64 flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-12 text-center", className)}>
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon aria-hidden="true" className={cn("size-5", kind === "loading" && "animate-spin motion-reduce:animate-none")} />
      </div>
      <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {children && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </section>
  );
}
