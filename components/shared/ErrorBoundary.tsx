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
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <Card className="w-full max-w-md border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6 pb-8 px-6 text-center">
              <div className="mx-auto mb-4 size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="size-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                We apologize for the inconvenience. Please try refreshing the
                page or contact support if the issue persists.
              </p>
              <Button onClick={this.handleRetry} className="gap-2">
                <RefreshCw className="size-4" />
                Refresh Page
              </Button>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 text-left text-xs text-muted-foreground">
                  <summary className="cursor-pointer mb-2">Error Details</summary>
                  <pre className="bg-background p-3 rounded border overflow-auto max-h-40">
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