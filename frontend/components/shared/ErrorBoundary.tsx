"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
          className="flex min-h-[60vh] items-center justify-center px-5 py-12"
        >
          <Card className="w-full max-w-lg rounded-3xl border-border bg-card">
            <CardContent className="p-8 text-center sm:p-10">
              <div className="mx-auto mb-6 size-12 rounded-2xl border border-destructive/20 bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground mb-3">
                Something went wrong
              </h2>
              <p className="text-sm leading-7 text-muted-foreground mb-7">
                We apologize for the inconvenience. Please try refreshing the
                page or contact support if the issue persists.
              </p>
              <Button
                onClick={this.handleRetry}
                className="h-11 gap-2 rounded-xl"
              >
                <RefreshCw className="size-4" />
                Refresh Page
              </Button>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 text-left text-xs text-muted-foreground">
                  <summary className="cursor-pointer mb-2">
                    Error Details
                  </summary>
                  <pre className="bg-background p-4 rounded-xl border border-border overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
