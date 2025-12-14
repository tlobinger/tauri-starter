/**
 * Tauri SQLite Adapter
 *
 * This adapter bridges Drizzle ORM with Tauri's SQL plugin.
 *
 * Why this exists:
 * - Next.js static export cannot access SQLite directly
 * - Tauri SQL plugin executes queries securely in the Rust backend
 * - Drizzle expects a database adapter that implements specific methods
 *
 * Architecture:
 * 1. Drizzle generates SQL statements + parameters
 * 2. This adapter forwards them to Tauri via IPC (invoke)
 * 3. Tauri SQL plugin executes queries against local SQLite
 * 4. Results are returned to Drizzle
 *
 * This pattern ensures:
 * - Type-safe queries (Drizzle)
 * - Secure database access (Tauri)
 * - Local-first architecture (SQLite)
 */

import { invoke } from "@tauri-apps/api/core";

interface QueryResult {
  rows: unknown[];
  rowsAffected: number;
  lastInsertId?: number;
}

/**
 * Creates a Drizzle-compatible SQLite adapter for Tauri
 *
 * This adapter implements the minimal interface required by Drizzle
 * to execute queries via Tauri's IPC bridge.
 */
export function createTauriSQLiteAdapter() {
  return {
    /**
     * Execute a SQL query and return results
     *
     * @param sql - The SQL statement to execute
     * @param params - Query parameters (prevents SQL injection)
     * @returns Query results
     */
    async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
      try {
        const result = await invoke<QueryResult>("execute_sql", {
          sql,
          params,
        });
        return result;
      } catch (error) {
        console.error("SQL execution error:", { sql, params, error });
        throw error;
      }
    },

    /**
     * Execute multiple SQL statements in a transaction
     *
     * @param queries - Array of [sql, params] tuples
     * @returns Array of query results
     */
    async batch(queries: Array<[string, unknown[]]>): Promise<QueryResult[]> {
      try {
        const result = await invoke<QueryResult[]>("execute_batch", {
          queries,
        });
        return result;
      } catch (error) {
        console.error("Batch execution error:", { queries, error });
        throw error;
      }
    },
  };
}
