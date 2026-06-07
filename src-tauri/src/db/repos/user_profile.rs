use sqlx::SqlitePool;

use crate::models::UserProfile;

const DEFAULT_USER_ID: &str = "user_local";

pub async fn ensure_seed(pool: &SqlitePool) -> anyhow::Result<()> {
    let exists: Option<(i64,)> = sqlx::query_as("SELECT 1 FROM user_profile WHERE id = ?")
        .bind(DEFAULT_USER_ID)
        .fetch_optional(pool)
        .await?;
    if exists.is_some() {
        sqlx::query(
            "UPDATE user_profile SET email = ? WHERE id = ? AND email = ?",
        )
        .bind("user@kathgpt.local")
        .bind(DEFAULT_USER_ID)
        .bind("legacy@kathgpt.local")
        .execute(pool)
        .await?;
        return Ok(());
    }

    let now = chrono::Utc::now().to_rfc3339();
    sqlx::query(
        "INSERT INTO user_profile (id, first_name, last_name, email, locale, default_model, accepted_guidelines, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(DEFAULT_USER_ID)
    .bind("John")
    .bind("Doe")
    .bind("user@kathgpt.local")
    .bind("en")
    .bind("gpt-4o-mini")
    .bind(1)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn update_me(
    pool: &SqlitePool,
    first_name: Option<&str>,
    last_name: Option<&str>,
    locale: Option<&str>,
    default_model: Option<&str>,
    accepted_guidelines: Option<bool>,
) -> anyhow::Result<UserProfile> {
    let now = chrono::Utc::now().to_rfc3339();

    if let Some(v) = first_name {
        sqlx::query("UPDATE user_profile SET first_name = ?, updated_at = ? WHERE id = ?")
            .bind(v)
            .bind(&now)
            .bind(DEFAULT_USER_ID)
            .execute(pool)
            .await?;
    }
    if let Some(v) = last_name {
        sqlx::query("UPDATE user_profile SET last_name = ?, updated_at = ? WHERE id = ?")
            .bind(v)
            .bind(&now)
            .bind(DEFAULT_USER_ID)
            .execute(pool)
            .await?;
    }
    if let Some(v) = locale {
        sqlx::query("UPDATE user_profile SET locale = ?, updated_at = ? WHERE id = ?")
            .bind(v)
            .bind(&now)
            .bind(DEFAULT_USER_ID)
            .execute(pool)
            .await?;
    }
    if let Some(v) = default_model {
        sqlx::query("UPDATE user_profile SET default_model = ?, updated_at = ? WHERE id = ?")
            .bind(v)
            .bind(&now)
            .bind(DEFAULT_USER_ID)
            .execute(pool)
            .await?;
    }
    if let Some(v) = accepted_guidelines {
        sqlx::query("UPDATE user_profile SET accepted_guidelines = ?, updated_at = ? WHERE id = ?")
            .bind(if v { 1 } else { 0 })
            .bind(&now)
            .bind(DEFAULT_USER_ID)
            .execute(pool)
            .await?;
    }

    get_me(pool).await
}

pub async fn get_me(pool: &SqlitePool) -> anyhow::Result<UserProfile> {
    let row: (String, Option<String>, Option<String>, Option<String>, String, String, i64) =
        sqlx::query_as(
            "SELECT id, first_name, last_name, email, locale, default_model, accepted_guidelines
             FROM user_profile WHERE id = ?",
        )
        .bind(DEFAULT_USER_ID)
        .fetch_one(pool)
        .await?;

    Ok(UserProfile {
        id: row.0,
        first_name: row.1,
        last_name: row.2,
        email: row.3,
        locale: row.4,
        default_model: row.5,
        accepted_guidelines: row.6 != 0,
    })
}
