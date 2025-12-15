"use client";

import React, { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

/**
 * React Error Boundary (must be a class component).
 *
 * Why?
 * - It catches render-time errors in child components and lets you show a friendly UI.
 * - Next.js route-level `error.tsx` is great, but a component-level boundary is useful
 *   around risky widgets or optional features.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="p-6">
          <div className="w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Component failed to render
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              You can try to reload this part of the UI.
            </p>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-zinc-50 p-3 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              {this.state.error.message}
            </pre>
            <div className="mt-4">
              <button
                type="button"
                onClick={this.reset}
                className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
