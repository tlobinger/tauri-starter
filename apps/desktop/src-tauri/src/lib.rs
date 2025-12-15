// Tauri Library
//
// This module exports the main Tauri app logic for use by the binary and tests.

mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize DevTools in debug builds only
    // This should be called as early as possible in the execution
    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();

    let builder = tauri::Builder::default();

    // Add DevTools plugin in debug builds
    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools);
    }

    builder
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
        .invoke_handler(tauri::generate_handler![commands::db::init_database])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
