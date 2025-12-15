"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You can replace this with a real logger later
    console.error("Route error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Something went wrong</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This page hit an error. You can try again.
        </p>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-zinc-700 dark:text-zinc-300">
            Error details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-zinc-50 p-3 text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            {error.message}
          </pre>
        </details>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}


