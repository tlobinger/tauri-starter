/**
 * Database Client
 *
 * This module provides the database connection for the frontend.
 *
 * Architecture:
 * - Uses Drizzle ORM for type-safe queries
 * - Connects via Tauri SQLite adapter (IPC bridge)
 * - Initialized once at app startup
 * - Safe to import from any component
 */

import { invoke } from "@tauri-apps/api/core";
import { createTauriSQLiteAdapter } from "@tauri-starter/db";
import * as schema from "@tauri-starter/db/schema";
import { drizzle } from "drizzle-orm/sqlite-proxy";

/**
 * Database instance
 *
 * This is a singleton that connects Drizzle to Tauri's SQL plugin.
 * It's safe to use throughout the app after initialization.
 */
const adapter = createTauriSQLiteAdapter();
export const db = drizzle(adapter, { schema });

/**
 * Initialize the database
 *
 * This function:
 * 1. Ensures the SQLite file exists
 * 2. Runs all pending migrations
 * 3. Prepares the database for queries
 *
 * Called once at app startup (see app/page.tsx)
 *
 * @throws Error if initialization fails
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log("🚀 Initializing database...");

    // Check if Tauri is available
    if (typeof window === "undefined" || !("__TAURI__" in window)) {
      throw new Error("Tauri runtime not available");
    }

    // Initialize database through Tauri
    await invoke("init_database");

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export type { Todo, NewTodo } from "@tauri-starter/db/schema";
