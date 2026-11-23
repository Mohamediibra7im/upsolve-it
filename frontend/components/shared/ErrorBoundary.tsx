"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="mx-auto grid min-h-[60vh] max-w-xl content-center justify-items-start gap-4 px-5 py-16"
        >
          <p className="t-eyebrow">Something went wrong</p>
          <h2 className="t-d2">That did not load.</h2>
          <p className="t-lg t-muted">
            We apologize for the inconvenience. Refresh the page, and if it
            keeps happening, report it on GitHub.
          </p>
          <button onClick={this.handleRetry} className="u-btn mt-2">
            <RefreshCw />
            Refresh Page
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="t-sm t-muted mt-4 w-full">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-line bg-surface p-4">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
