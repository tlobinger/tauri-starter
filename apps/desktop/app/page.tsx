"use client";

import { initializeDatabase } from "@/lib/db";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const TodoList = dynamic(async () => (await import("@/components/TodoList")).TodoList, {
  ssr: false,
});

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize database on app startup
    initializeDatabase()
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        const message =
          typeof err === "string" ? err : err?.message ? err.message : JSON.stringify(err, null, 2);
        setError(message || "Failed to initialize app");
      });
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mt-4 mb-8 flex-col items-center gap-2">
          <span>Initialization Error</span>
          <pre className="whitespace-pre-wrap warp-break-word text-sm">{error}</pre>
        </h1>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mt-4 mb-8 flex items-center gap-2">
          <Spinner size="md" />
          <span>Loading ...</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mt-4 mb-8">Stuff to do</h1>

      <TodoList />
    </div>
  );
}
