"use client";

import { useEffect, useState } from "react";
import { TodoList } from "@/components/TodoList";
import { initializeDatabase } from "@/lib/db";
import styles from "./page.module.css";

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
        console.error("Failed to initialize database:", err);
        setError(err.message || "Failed to initialize database");
      });
  }, []);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>❌ Initialization Error</h1>
          <p>{error}</p>
          <p className={styles.errorDetails}>
            Check the console for more details. This usually means:
          </p>
          <ul>
            <li>Database migration failed</li>
            <li>Tauri SQL plugin not configured</li>
            <li>File permissions issue</li>
          </ul>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h1>🔄 Initializing...</h1>
          <p>Setting up database and running migrations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📝 Todo App</h1>
        <p className={styles.subtitle}>
          A production-grade local-first desktop app built with Tauri + Next.js
        </p>
      </header>

      <main className={styles.main}>
        <TodoList />
      </main>

      <footer className={styles.footer}>
        <p>
          Built with <strong>Tauri v2</strong> + <strong>Next.js 16</strong> +{" "}
          <strong>SQLite</strong>
        </p>
      </footer>
    </div>
  );
}
