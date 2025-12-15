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
import { createTauriSQLiteAdapter, migrations } from "@tauri-starter/db";
import * as schema from "@tauri-starter/db/schema";
import { drizzle } from "drizzle-orm/sqlite-proxy";

/**
 * Check if Tauri API is available
 * In Tauri v2, we check for the internals object
 */
function isTauriAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  // Check for Tauri v2 internals
  const win = window as unknown as Record<string, unknown>;
  return typeof win.__TAURI_INTERNALS__ !== "undefined" || typeof win.__TAURI__ !== "undefined";
}

/**
 * Database instance
 *
 * This is a singleton that connects Drizzle to Tauri's SQL plugin.
 * It's safe to use throughout the app after initialization.
 */
const adapter = createTauriSQLiteAdapter();
export const db = drizzle(adapter, { schema });

/**
 * Direct database adapter for migrations and raw queries
 * This is used internally for migrations and verification
 */
export const dbAdapter = {
  async execute(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const db = await getDatabase();
    const isSelect =
      sql.trim().toLowerCase().startsWith("select") || sql.trim().toLowerCase().startsWith("with");

    if (isSelect) {
      const rows = (await db.select(sql, params)) as unknown[];
      return {
        rows,
        rowsAffected: 0,
        lastInsertId: undefined,
      };
    }

    const result = await db.execute(sql, params);
    return {
      rows: [],
      rowsAffected: result.rowsAffected ?? 0,
      lastInsertId: result.lastInsertId ?? undefined,
    };
  },
};

// Helper to get database connection
async function getDatabase() {
  const Database = (await import("@tauri-apps/plugin-sql")).default;
  return Database.load("sqlite:app.db");
}

interface QueryResult {
  rows: unknown[];
  rowsAffected: number;
  lastInsertId?: number;
}

/**
 * Run database migrations
 *
 * This uses the database adapter directly to execute migration SQL.
 */
async function runMigrations(): Promise<void> {
  console.log("🔄 Running database migrations...");

  try {
    // Create migrations tracking table
    console.log("📋 Creating migrations tracking table...");
    await dbAdapter.execute(
      `
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        applied_at INTEGER NOT NULL
      )
      `,
      []
    );
    console.log("✅ Migrations tracking table ready");
  } catch (error) {
    console.error("❌ Failed to create migrations table:", error);
    throw error;
  }

  // Use migrations imported from the db package
  const migrationsToRun = migrations;
  const migrationCount: number = migrationsToRun.length;

  if (migrationCount === 0) {
    console.log("✅ No migrations to apply");
    return;
  }

  for (const migration of migrationsToRun) {
    // Check if already applied
    const result = await dbAdapter.execute(
      "SELECT COUNT(*) as count FROM __drizzle_migrations WHERE name = ?",
      [migration.name]
    );

    const countRow = result.rows[0] as { count: number } | undefined;
    const count: number = countRow?.count ?? 0;
    const alreadyApplied = count > 0;

    if (alreadyApplied) {
      console.log(`⏭️  Skipping ${migration.name} (already applied)`);
      continue;
    }

    console.log(`⚙️  Applying ${migration.name}...`);

    // Apply migration - split by semicolon to handle multiple statements
    const statements = migration.sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`  Executing ${statements.length} statement(s) from migration...`);
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`  Statement ${i + 1}/${statements.length}:`, `${statement.substring(0, 80)}...`);
      await dbAdapter.execute(statement, []);
    }

    // Record migration
    await dbAdapter.execute("INSERT INTO __drizzle_migrations (name, applied_at) VALUES (?, ?)", [
      migration.name,
      Date.now(),
    ]);

    console.log(`✅ Applied ${migration.name}`);
  }

  console.log("✅ All migrations completed successfully");
}

/**
 * Initialize the database
 *
 * This function:
 * 1. Ensures the SQLite file exists (via Rust command)
 * 2. Runs all pending migrations (via adapter)
 * 3. Prepares the database for queries
 *
 * Called once at app startup (see app/page.tsx)
 *
 * @throws Error if initialization fails
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log("🚀 Initializing database...");

    // Skip initialization on server-side (Next.js SSR)
    if (typeof window === "undefined") {
      console.warn("Skipping DB init: running on server");
      return;
    }

    // Step 1: Check if Tauri is available before trying to use it
    if (!isTauriAvailable()) {
      throw new Error(
        "Tauri runtime not available. Make sure you're running the app with 'bun run tauri:dev' " +
          "and viewing it in the Tauri window, not in a regular browser."
      );
    }

    // Step 2: Ensure database directory exists (via Rust command)
    // In Tauri v2, we call invoke directly - if Tauri isn't available,
    // it will throw an error that we can catch and provide a helpful message
    try {
      await invoke("init_database");
    } catch (error: unknown) {
      // Check if this is a "Tauri not available" error
      const errorMessage = String(
        error && typeof error === "object" && "message" in error ? error.message : (error ?? "")
      ).toLowerCase();

      // Common Tauri v2 error patterns when runtime isn't available
      const errorCode =
        error && typeof error === "object" && "code" in error ? error.code : undefined;
      const isTauriError =
        errorMessage.includes("tauri") ||
        errorMessage.includes("ipc") ||
        errorMessage.includes("not available") ||
        errorMessage.includes("runtime") ||
        errorCode === "TAURI_NOT_AVAILABLE";

      if (isTauriError) {
        const friendlyError = new Error(
          "Tauri runtime not available. Make sure you're running the app with 'bun run tauri:dev' " +
            "and viewing it in the Tauri window, not in a regular browser."
        );
        console.error("❌ Database initialization failed:", friendlyError);
        console.error("Original error:", error);
        throw friendlyError;
      }
      // If it's not a Tauri error, re-throw it (might be a real DB error)
      throw error;
    }

    // Step 3: Verify database connection by running a test query
    console.log("🔍 Verifying database connection...");
    try {
      // First, try to load the database connection
      const testResult = await dbAdapter.execute("SELECT 1 as test", []);
      console.log("✅ Database connection verified:", testResult);

      // Also check what tables exist
      const tablesResult = await dbAdapter.execute(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
        []
      );
      console.log("📋 Existing tables:", tablesResult.rows);
    } catch (error) {
      console.error("❌ Database connection verification failed:", error);
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : String(error);
      console.error("Error details:", errorDetails);
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Step 4: Run migrations using the adapter
    await runMigrations();

    // Step 5: Verify todos table exists
    console.log("🔍 Verifying todos table exists...");
    try {
      const tableCheck = await dbAdapter.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='todos'",
        []
      );
      if (tableCheck.rows.length === 0) {
        throw new Error("Todos table was not created by migrations");
      }
      console.log("✅ Todos table verified:", tableCheck);
    } catch (error) {
      console.error("❌ Todos table verification failed:", error);
      throw error;
    }

    console.log("✅ Database initialized successfully");
  } catch (error: unknown) {
    // This is a real database error (migrations, permissions, etc.)
    console.error("❌ Database initialization failed:", error);
    throw error;
  }
}

export type { Todo, NewTodo } from "@tauri-starter/db/schema";
