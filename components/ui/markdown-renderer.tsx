"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const MarkdownContent = dynamic(
  () =>
    import("./markdown-content").then((mod) => mod.MarkdownContent),
  {
    ssr: false,
    loading: () => (
      <div className="prose prose-sm dark:prose-invert max-w-none animate-pulse" data-testid="markdown-loading">
        <div className="h-4 bg-muted rounded w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded w-full mb-2" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>
    ),
  }
);

interface MarkdownRendererProps {
  children: ReactNode;
  className?: string;
}

export function MarkdownRenderer({
  children,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={className} data-testid="markdown-container">
      <MarkdownContent content={String(children)} />
    </div>
  );
}

export default MarkdownRenderer;