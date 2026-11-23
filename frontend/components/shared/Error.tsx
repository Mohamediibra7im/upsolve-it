"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

const Error = ({
  message = "An unexpected error occurred.",
  onRetry = () => window.location.reload(),
}: ErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AlertTriangle className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-3xl font-medium text-foreground tracking-tight sm:text-4xl">
          Something went wrong
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <div className="mt-8">
          <Button onClick={onRetry} size="lg" variant="outline">
            <RotateCw className="mr-2 size-5" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
