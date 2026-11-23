"use client";

import ErrorState from "@/components/shared/Error";

export default function PageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content">
      <ErrorState
        message="We couldn’t load this page. Give it another try, or return to it in a moment."
        onRetry={reset}
      />
    </main>
  );
}
