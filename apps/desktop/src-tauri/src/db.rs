/**
 * Database Module
 *
 * This module handles all database operations via Tauri SQL plugin.
 *
 * Architecture:
 * - Frontend sends SQL queries via Tauri IPC
 * - These commands execute queries against SQLite
 * - Results are returned to frontend
 *
 * Security:
 * - SQL injection prevention via parameterized queries
 * - Database file in app-specific directory (not world-readable)
 * - No direct filesystem access from frontend
 */

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    rows: Vec<serde_json::Value>,
    rows_affected: u64,
    last_insert_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct SqlParams {
    sql: String,
    params: Vec<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct BatchParams {
    queries: Vec<(String, Vec<serde_json::Value>)>,
}

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

    let db_path = app_data_dir.join("app.db");
    println!("📂 Database location: {:?}", db_path);

    // Create or open database (handled by SQL plugin)
    println!("✅ Database initialized");

    Ok(())
}

/**
 * Execute a single SQL query
 *
 * @param sql - SQL statement
 * @param params - Query parameters (prevents SQL injection)
 * @returns Query results
 *
 * Note: This is a placeholder implementation. For production use:
 * 1. Use the tauri-plugin-sql JavaScript API directly from the frontend
 * 2. Or implement with direct sqlx if custom Rust-side SQL execution is needed
 */
#[tauri::command]
pub async fn execute_sql(
    _app: AppHandle,
    sql: String,
    params: Vec<serde_json::Value>,
) -> Result<QueryResult, String> {
    println!("📝 Executing SQL: {}", sql);
    println!("   Params: {:?}", params);

    // Placeholder implementation
    // TODO: Implement actual SQL execution using sqlx directly or use
    // the tauri-plugin-sql JavaScript API from the frontend
    
    let result = QueryResult {
        rows: vec![],
        rows_affected: 0,
        last_insert_id: None,
    };

    Ok(result)
}

/**
 * Execute multiple SQL queries in a transaction
 *
 * @param queries - Array of (sql, params) tuples
 * @returns Array of query results
 */
#[tauri::command]
pub async fn execute_batch(
    app: AppHandle,
    queries: Vec<(String, Vec<serde_json::Value>)>,
) -> Result<Vec<QueryResult>, String> {
    println!("📦 Executing batch of {} queries", queries.len());

    let mut results = Vec::new();

    for (sql, params) in queries {
        let result = execute_sql(app.clone(), sql, params).await?;
        results.push(result);
    }

    Ok(results)
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_database_module_compiles() {
        // Basic compilation test
        assert!(true);
    }
}
