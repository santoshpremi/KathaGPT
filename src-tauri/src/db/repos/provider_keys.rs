use sqlx::SqlitePool;

use crate::crypto::decrypt_key;
use crate::models::{ProviderKeyStatus, PROVIDER_IDS};

fn is_valid_key(key: &str) -> bool {
    let key = key.trim();
    key.len() > 8
        && !key.starts_with("enc:")
        && !key.contains("your_")
        && !key.contains("_here")
}

pub fn mask_api_key(key: &str) -> String {
    if key.len() <= 8 {
        return "••••••••".to_string();
    }
    format!("{}••••{}", &key[..7.min(key.len())], &key[key.len().saturating_sub(4)..])
}

fn env_fallback(provider: &str) -> Option<String> {
    let key = match provider {
        "openrouter" => std::env::var("OPENROUTER_API_KEY").ok(),
        "openai" => std::env::var("OPENAI_API_KEY").ok(),
        "anthropic" => std::env::var("ANTHROPIC_API_KEY").ok(),
        "gemini" => std::env::var("GEMINI_API_KEY")
            .or_else(|_| std::env::var("GOOGLE_API_KEY"))
            .ok(),
        "perplexity" => std::env::var("PERPLEXITY_API_KEY").ok(),
        _ => None,
    }?;
    if is_valid_key(&key) {
        Some(key)
    } else {
        None
    }
}

fn parse_stored_api_key(raw: &str) -> Option<String> {
    let key = if raw.starts_with("enc:") {
        decrypt_key(raw).ok()?
    } else {
        raw.to_string()
    };
    let key = key.trim().to_string();
    is_valid_key(&key).then_some(key)
}

pub async fn get_stored_key(pool: &SqlitePool, provider: &str) -> anyhow::Result<Option<String>> {
    let row: Option<(String,)> =
        sqlx::query_as("SELECT api_key FROM provider_keys WHERE provider = ?")
            .bind(provider)
            .fetch_optional(pool)
            .await?;
    Ok(row.and_then(|r| parse_stored_api_key(&r.0)))
}

pub async fn has_stored_key_row(pool: &SqlitePool, provider: &str) -> anyhow::Result<bool> {
    let row: Option<(String,)> =
        sqlx::query_as("SELECT api_key FROM provider_keys WHERE provider = ?")
            .bind(provider)
            .fetch_optional(pool)
            .await?;
    Ok(row.is_some())
}

pub async fn effective_key(pool: &SqlitePool, provider: &str) -> anyhow::Result<Option<String>> {
    if let Some(stored) = get_stored_key(pool, provider).await? {
        if is_valid_key(&stored) {
            return Ok(Some(stored));
        }
    }
    Ok(env_fallback(provider))
}

pub async fn set_key(pool: &SqlitePool, provider: &str, api_key: &str) -> anyhow::Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    let trimmed = api_key.trim().to_string();
    if !is_valid_key(&trimmed) {
        anyhow::bail!("API key too short or invalid");
    }
    // Local edition: store plaintext so keys survive dev restarts (encryption master key was unstable).
    sqlx::query(
        "INSERT INTO provider_keys (provider, api_key, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(provider) DO UPDATE SET api_key = excluded.api_key, updated_at = excluded.updated_at",
    )
    .bind(provider)
    .bind(trimmed)
    .bind(now)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn clear_key(pool: &SqlitePool, provider: &str) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM provider_keys WHERE provider = ?")
        .bind(provider)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn get_status(pool: &SqlitePool) -> anyhow::Result<Vec<ProviderKeyStatus>> {
    let mut statuses = Vec::new();
    for id in PROVIDER_IDS {
        let stored = get_stored_key(pool, id).await?;
        let has_row = has_stored_key_row(pool, id).await?;
        let stored_valid = stored.is_some();
        let env = if stored_valid {
            None
        } else {
            env_fallback(id)
        };
        let effective = stored.or(env);
        let configured = effective.is_some();
        let source = if stored_valid {
            "stored"
        } else if has_row {
            "corrupt"
        } else if effective.is_some() {
            "env"
        } else {
            "none"
        };
        statuses.push(ProviderKeyStatus {
            id: id.to_string(),
            configured,
            source: source.to_string(),
            masked_key: effective.as_deref().map(mask_api_key),
        });
    }
    Ok(statuses)
}

pub async fn has_stored_key(pool: &SqlitePool, provider: &str) -> anyhow::Result<bool> {
    Ok(get_stored_key(pool, provider)
        .await?
        .is_some_and(|k| is_valid_key(&k)))
}

pub async fn has_any_stored_provider(pool: &SqlitePool) -> anyhow::Result<bool> {
    for id in PROVIDER_IDS {
        if has_stored_key(pool, id).await? {
            return Ok(true);
        }
    }
    Ok(false)
}

pub async fn has_any_provider(pool: &SqlitePool) -> anyhow::Result<bool> {
    for id in PROVIDER_IDS {
        if effective_key(pool, id).await?.is_some() {
            return Ok(true);
        }
    }
    Ok(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mask_short_key() {
        assert_eq!(mask_api_key("short"), "••••••••");
    }
}
