"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const MarkdownContent = dynamic(
  () => import("./markdown-content").then((mod) => mod.MarkdownContent),
  {
    ssr: false,
    loading: () => (
      <div
        className="space-y-2.5 animate-pulse motion-reduce:animate-none"
        data-testid="markdown-loading"
      >
        <div className="h-5 bg-muted rounded-md w-3/4 mb-4" />
        <div className="h-4 bg-muted rounded-md w-1/2 mb-2" />
        <div className="h-4 bg-muted rounded-md w-full mb-2" />
        <div className="h-4 bg-muted rounded-md w-5/6" />
      </div>
    ),
  },
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
