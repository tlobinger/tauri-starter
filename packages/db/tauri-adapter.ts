/**
 * Tauri SQLite Adapter
 *
 * This adapter bridges Drizzle ORM with Tauri's SQL plugin (JavaScript API).
 *
 * Why this exists:
 * - Next.js static export cannot access SQLite directly
 * - Tauri SQL plugin executes queries securely in the Rust backend
 * - Drizzle expects a database adapter that implements specific methods
 *
 * Architecture:
 * 1. Drizzle generates SQL statements + parameters
 * 2. This adapter forwards them to the `@tauri-apps/plugin-sql` driver
 * 3. The plugin executes queries against local SQLite
 * 4. Results are returned to Drizzle
 *
 * This pattern ensures:
 * - Type-safe queries (Drizzle)
 * - Secure database access (Tauri)
 * - Local-first architecture (SQLite)
 */

import Database from "@tauri-apps/plugin-sql";

type SqlDriver = Awaited<ReturnType<(typeof Database)["load"]>>;

let dbPromise: Promise<SqlDriver> | null = null;

async function getDatabase(): Promise<SqlDriver> {
  if (!dbPromise) {
    // The connection string is configured to match `tauri.conf.json`
    // where we preload: "sqlite:app.db".
    console.log("🔌 Loading SQLite database connection...");
    try {
      dbPromise = Database.load("sqlite:app.db");
      const db = await dbPromise;
      console.log("✅ Database connection established");
      return db;
    } catch (error) {
      console.error("❌ Failed to load database:", error);
      throw error;
    }
  }
  return dbPromise;
}

function isSelectQuery(sql: string): boolean {
  const trimmed = sql.trim().toLowerCase();
  // Very small heuristic that is good enough for the starter:
  return trimmed.startsWith("select") || trimmed.startsWith("with");
}

/**
 * Creates a Drizzle-compatible SQLite adapter callback for Tauri
 *
 * Drizzle's sqlite-proxy expects a callback function with signature:
 * (sql: string, params: any[], method: "run" | "all" | "values" | "get") => Promise<{ rows: any[] }>
 *
 * This adapter bridges Drizzle ORM with Tauri's SQL plugin.
 */
export function createTauriSQLiteAdapter() {
  return async (
    sql: string,
    params: unknown[],
    method: "run" | "all" | "values" | "get",
  ): Promise<{ rows: unknown[] }> => {
    const db = await getDatabase();

    try {
      // Log SQL queries in debug mode (helpful for debugging)
      const isSelect = isSelectQuery(sql);
      console.log(`📝 Executing ${isSelect ? "SELECT" : "WRITE"} query (method: ${method}):`, {
        sql: sql.substring(0, 100) + (sql.length > 100 ? "..." : ""),
        params: params.length > 0 ? params : undefined,
      });

      if (isSelect || method === "all" || method === "get" || method === "values") {
        // For SELECT-style methods, use db.select()
        // Tauri SQL plugin returns rows as objects: { columnName: value, ... }
        const rawRows = (await db.select(sql, params)) as Record<string, unknown>[];
        console.log(`✅ SELECT returned ${rawRows.length} row(s)`);

        // drizzle-orm/sqlite-proxy expects each row as an array of column values
        // in the same order as in the SELECT statement.
        const rowsAsArrays = rawRows.map((row) => Object.values(row));

        // If method is "get", drizzle expects a single row (or empty)
        if (method === "get") {
          const firstRow = rowsAsArrays.length > 0 ? rowsAsArrays[0] : [];
          return { rows: [firstRow] };
        }

        // For "all" and "values", return all row arrays
        return { rows: rowsAsArrays };
      }

      // For INSERT/UPDATE/DELETE (method "run"), use db.execute()
      const result = await db.execute(sql, params);
      console.log(`✅ WRITE affected ${result.rowsAffected ?? 0} row(s)`, {
        lastInsertId: result.lastInsertId,
      });

      // For "run" and "values" on non-SELECT, return empty rows (Drizzle expects this shape)
      return { rows: [] };
    } catch (error) {
      console.error("❌ SQL execution error:", {
        sql: sql.substring(0, 200),
        params,
        method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };
}
