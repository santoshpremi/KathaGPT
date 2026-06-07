use directories::ProjectDirs;
use std::path::PathBuf;

const APP_QUALIFIER: &str = "com";
const APP_ORG: &str = "KathaGPT";
const APP_NAME: &str = "KathaGPT";

/// OS-specific application data directory.
/// macOS: ~/Library/Application Support/KathaGPT/
/// Windows: %APPDATA%\KathaGPT\
/// Linux: ~/.local/share/KathaGPT/
pub fn app_data_dir() -> anyhow::Result<PathBuf> {
    let dirs = ProjectDirs::from(APP_QUALIFIER, APP_ORG, APP_NAME)
        .ok_or_else(|| anyhow::anyhow!("Could not resolve application data directory"))?;
    Ok(dirs.data_dir().to_path_buf())
}

pub fn database_path() -> anyhow::Result<PathBuf> {
    Ok(app_data_dir()?.join("kathagpt.db"))
}

/// Default Axum listen port for the embedded local API server.
pub const DEFAULT_API_PORT: u16 = 17890;
