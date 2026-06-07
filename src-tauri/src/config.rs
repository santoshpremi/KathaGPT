use directories::ProjectDirs;
use std::path::PathBuf;

const APP_QUALIFIER: &str = "com";
const APP_ORG: &str = "KathGPT";
const APP_NAME: &str = "KathGPT";

/// OS-specific application data directory.
/// macOS: ~/Library/Application Support/KathGPT/
/// Windows: %APPDATA%\KathGPT\
/// Linux: ~/.local/share/KathGPT/
pub fn app_data_dir() -> anyhow::Result<PathBuf> {
    let dirs = ProjectDirs::from(APP_QUALIFIER, APP_ORG, APP_NAME)
        .ok_or_else(|| anyhow::anyhow!("Could not resolve application data directory"))?;
    Ok(dirs.data_dir().to_path_buf())
}

pub fn database_path() -> anyhow::Result<PathBuf> {
    Ok(app_data_dir()?.join("kathgpt.db"))
}

/// Default Axum listen port for the embedded local API server.
pub const DEFAULT_API_PORT: u16 = 17890;
