mod import;
pub mod repos;

use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use sqlx::SqlitePool;
use std::str::FromStr;
use tracing::info;

use crate::config;
use repos::{user_profile, workflows};

pub async fn init_pool() -> anyhow::Result<SqlitePool> {
    let data_dir = config::app_data_dir()?;
    std::fs::create_dir_all(&data_dir)?;

    let db_path = config::database_path()?;
    info!("Database path: {}", db_path.display());

    let options = SqliteConnectOptions::from_str(&format!("sqlite:{}", db_path.display()))?
        .create_if_missing(true)
        .foreign_keys(true);

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await?;

    run_migrations(&pool).await?;
    user_profile::ensure_seed(&pool).await?;
    workflows::ensure_seed(&pool).await?;
    import::import_legacy_if_needed(&pool).await?;
    Ok(pool)
}

async fn run_migrations(pool: &SqlitePool) -> anyhow::Result<()> {
    let migration_sql = include_str!("../../../migrations/001_initial.sql");

    for statement in migration_sql.split(';') {
        let sql = statement.trim();
        if sql.is_empty() || sql.starts_with("--") {
            continue;
        }
        sqlx::query(sql).execute(pool).await?;
    }

    sqlx::query(
        "INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (1, datetime('now'))",
    )
    .execute(pool)
    .await?;

    info!("SQLite migrations applied");
    Ok(())
}
