"use client";

import { RotateCw } from "lucide-react";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error = ({
  message = "An unexpected error occurred.",
  onRetry = () => window.location.reload(),
}: ErrorProps) => (
  <div className="mx-auto grid min-h-[calc(100dvh-16rem)] max-w-xl content-center justify-items-start gap-4 px-5 py-16">
    <p className="t-eyebrow">Something went wrong</p>
    <h1 className="t-d2">That did not load.</h1>
    <p className="t-lg t-muted">{message}</p>
    <button onClick={onRetry} className="u-btn mt-2">
      <RotateCw />
      Try again
    </button>
  </div>
);

export default Error;
