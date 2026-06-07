mod api;
mod crypto;
pub mod config;
pub mod db;
pub mod llm;
pub mod models;
pub mod server;

use std::path::PathBuf;
use std::sync::atomic::{AtomicU16, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tracing::info;
use tracing_subscriber::EnvFilter;

static API_PORT: AtomicU16 = AtomicU16::new(0);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::from_default_env()
                .add_directive("kathgpt_local=info".parse().unwrap())
                .add_directive("sqlx=warn".parse().unwrap()),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_api_port])
        .setup(|app| {
            let open_item = MenuItem::with_id(app, "open", "Open KathGPT", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&open_item, &quit_item])?;

            let icon = app
                .default_window_icon()
                .cloned()
                .ok_or_else(|| anyhow::anyhow!("Missing default window icon"))?;

            let _tray = TrayIconBuilder::new()
                .icon(icon)
                .menu(&tray_menu)
                .tooltip("KathGPT")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => show_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        show_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = start_backend(&handle).await {
                    tracing::error!("Failed to start local backend: {err}");
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn start_backend(handle: &tauri::AppHandle) -> anyhow::Result<()> {
    let pool = db::init_pool().await?;

    let dist_dir = resolve_dist_dir(handle);

    let state = server::AppState {
        db: pool,
        dist_dir,
    };

    let port = server::start(state).await?;
    API_PORT.store(port, Ordering::SeqCst);
    info!("KathGPT Local backend ready on port {port}");
    Ok(())
}

fn resolve_dist_dir(handle: &tauri::AppHandle) -> Option<PathBuf> {
    if cfg!(debug_assertions) {
        return None;
    }
    if let Ok(resource) = handle.path().resource_dir() {
        let dist = resource.join("dist");
        if dist.join("index.html").exists() {
            return Some(dist);
        }
    }
    let fallback = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../dist");
    if fallback.join("index.html").exists() {
        return Some(fallback);
    }
    None
}

#[tauri::command]
fn get_api_port() -> u16 {
    API_PORT.load(Ordering::SeqCst)
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}
