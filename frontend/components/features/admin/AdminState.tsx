import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/kit";
import Loader from "@/components/shared/Loader";

type AdminStateProps = {
  title: string;
  description?: string;
  tone?: "empty" | "loading" | "error";
  action?: ReactNode;
  className?: string;
};

export function AdminState({
  title,
  description,
  tone = "empty",
  action,
  className,
}: AdminStateProps) {
  if (tone === "loading") return <Loader fullScreen={false} message={title} />;

  return (
    <div role={tone === "error" ? "alert" : undefined}>
      <EmptyState title={title} action={action} className={className}>
        {description}
      </EmptyState>
    </div>
  );
}

export function AdminRetry({ onRetry }: { onRetry: () => unknown }) {
  return (
    <Button variant="outline" onClick={() => void onRetry()}>
      Try again
    </Button>
  );
}
