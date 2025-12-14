// Tauri Library
//
// This module exports the main Tauri app logic for use by the binary and tests.

mod db;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .setup(|app| {
            // Get app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Ensure the directory exists
            std::fs::create_dir_all(&app_data_dir)
                .expect("Failed to create app data directory");

            let db_path = app_data_dir.join("app.db");
            println!("Database path: {:?}", db_path);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            db::init_database,
            db::execute_sql,
            db::execute_batch,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
