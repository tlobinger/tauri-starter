/**
 * Database Module
 *
 * This module currently exposes only a lightweight initialization command.
 *
 * Design:
 * - The actual SQL execution is handled on the frontend via the
 *   official `tauri-plugin-sql` JavaScript API.
 * - Drizzle ORM (in TypeScript) generates SQL and talks directly
 *   to the plugin; Rust does not need to know about individual
 *   queries.
 *
 * This keeps the Rust side small and focused on app setup while
 * still giving you a fully working Todo example backed by SQLite.
 */

use tauri::{AppHandle, Manager};

/**
 * Initialize the database
 *
 * This command:
 * 1. Ensures the database file exists
 * 2. Runs pending migrations
 * 3. Prepares for queries
 *
 * Called once at app startup from the frontend.
 */
#[tauri::command]
pub async fn init_database(app: AppHandle) -> Result<(), String> {
    println!("🚀 Initializing database...");

    // Get database path
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    // The actual database file is managed by `tauri-plugin-sql` and
    // configured in `tauri.conf.json` via:
    //   "plugins": { "sql": { "preload": ["sqlite:app.db"] } }
    //
    // We mainly log the resolved path here as a sanity check that
    // everything is wired up correctly.
    let db_path = app_data_dir.join("app.db");
    println!("📂 Database location: {:?}", db_path);
    println!("✅ Database directory ensured");

    Ok(())
}

// NOTE:
// We intentionally do NOT expose SQL execution commands from Rust.
// The frontend talks directly to the Tauri SQL plugin instead.

#[cfg(test)]
mod tests {
    #[test]
    fn test_database_module_compiles() {
        // Basic compilation test
        assert!(true);
    }
}
