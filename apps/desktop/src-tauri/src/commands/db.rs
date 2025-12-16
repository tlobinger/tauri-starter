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

    let db_path = get_database_path(&app_data_dir);
    println!("📂 Database location: {:?}", db_path);
    Ok(())
}

/// Get the database path for a given app data directory.
/// This is extracted for testability.
pub fn get_database_path(app_data_dir: &std::path::Path) -> std::path::PathBuf {
    app_data_dir.join("app.db")
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn test_get_database_path() {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let app_data_dir = temp_dir.path();
        
        let db_path = get_database_path(app_data_dir);
        
        assert_eq!(db_path, app_data_dir.join("app.db"));
        assert!(db_path.to_string_lossy().ends_with("app.db"));
    }

    #[test]
    fn test_get_database_path_with_nested_path() {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let nested_dir = temp_dir.path().join("nested").join("path");
        
        let db_path = get_database_path(&nested_dir);
        
        assert_eq!(db_path, nested_dir.join("app.db"));
    }

    #[test]
    fn test_database_path_is_absolute() {
        let temp_dir = TempDir::new().expect("Failed to create temp directory");
        let db_path = get_database_path(temp_dir.path());
        
        assert!(db_path.is_absolute());
    }
}


