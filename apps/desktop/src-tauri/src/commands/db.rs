use anyhow::Context;
use tauri::{AppHandle, Manager};

/**
 * Initialize the database.
 *
 * Note: SQL execution is handled on the frontend via `tauri-plugin-sql`.
 * This command only ensures the app data directory exists and logs the resolved path.
 */
#[tauri::command]
pub async fn init_database(app: AppHandle) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .context("Failed to get app data directory")
        .map_err(|e| e.to_string())?;

    std::fs::create_dir_all(&app_data_dir)
        .context("Failed to create app data directory")
        .map_err(|e| e.to_string())?;

    let db_path = app_data_dir.join("app.db");
    println!("📂 Database location: {:?}", db_path);
    Ok(())
}


