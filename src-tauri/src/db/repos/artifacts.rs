use sqlx::SqlitePool;
use uuid::Uuid;

use crate::models::{Artifact, ArtifactVersion};

pub async fn get_by_chat_id(
    pool: &SqlitePool,
    chat_id: &str,
) -> anyhow::Result<Option<Artifact>> {
    let row: Option<(String, String, String, String, String)> = sqlx::query_as(
        "SELECT id, chat_id, title, content, created_at FROM artifacts WHERE chat_id = ? LIMIT 1",
    )
    .bind(chat_id)
    .fetch_optional(pool)
    .await?;

    Ok(row.map(|r| Artifact {
        id: r.0,
        chat_id: r.1,
        title: r.2,
        content: r.3,
        created_at: r.4,
    }))
}

pub async fn list_versions(
    pool: &SqlitePool,
    artifact_id: &str,
) -> anyhow::Result<Vec<ArtifactVersion>> {
    let rows: Vec<(String, String, String, i32, i64, String)> = sqlx::query_as(
        "SELECT id, artifact_id, content, version, from_chat, created_at
         FROM artifact_versions WHERE artifact_id = ? ORDER BY version ASC",
    )
    .bind(artifact_id)
    .fetch_all(pool)
    .await?;

    Ok(rows
        .into_iter()
        .map(|r| ArtifactVersion {
            id: r.0,
            artifact_id: r.1,
            content: r.2,
            version: r.3,
            from_chat: r.4 != 0,
            created_at: r.5,
        })
        .collect())
}

pub async fn get_version_by_id(
    pool: &SqlitePool,
    version_id: &str,
) -> anyhow::Result<Option<(ArtifactVersion, String)>> {
    let row: Option<(String, String, String, i32, i64, String, String)> = sqlx::query_as(
        "SELECT v.id, v.artifact_id, v.content, v.version, v.from_chat, v.created_at, a.title
         FROM artifact_versions v
         JOIN artifacts a ON a.id = v.artifact_id
         WHERE v.id = ?",
    )
    .bind(version_id)
    .fetch_optional(pool)
    .await?;

    Ok(row.map(|r| {
        (
            ArtifactVersion {
                id: r.0,
                artifact_id: r.1,
                content: r.2,
                version: r.3,
                from_chat: r.4 != 0,
                created_at: r.5,
            },
            r.6,
        )
    }))
}

pub async fn get(pool: &SqlitePool, id: &str) -> anyhow::Result<Option<Artifact>> {
    let row: Option<(String, String, String, String, String)> = sqlx::query_as(
        "SELECT id, chat_id, title, content, created_at FROM artifacts WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(row.map(|r| Artifact {
        id: r.0,
        chat_id: r.1,
        title: r.2,
        content: r.3,
        created_at: r.4,
    }))
}

pub async fn get_version(
    pool: &SqlitePool,
    artifact_id: &str,
    version_id: &str,
) -> anyhow::Result<Option<ArtifactVersion>> {
    let row: Option<(String, String, String, i32, i64, String)> = sqlx::query_as(
        "SELECT id, artifact_id, content, version, from_chat, created_at
         FROM artifact_versions WHERE artifact_id = ? AND id = ?",
    )
    .bind(artifact_id)
    .bind(version_id)
    .fetch_optional(pool)
    .await?;

    Ok(row.map(|r| ArtifactVersion {
        id: r.0,
        artifact_id: r.1,
        content: r.2,
        version: r.3,
        from_chat: r.4 != 0,
        created_at: r.5,
    }))
}

pub async fn create_version(
    pool: &SqlitePool,
    artifact_id: &str,
    content: &str,
    from_chat: bool,
) -> anyhow::Result<ArtifactVersion> {
    let artifact = get(pool, artifact_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Artifact not found"))?;

    let (next_version,): (i32,) = sqlx::query_as(
        "SELECT COALESCE(MAX(version), 0) + 1 FROM artifact_versions WHERE artifact_id = ?",
    )
    .bind(artifact_id)
    .fetch_one(pool)
    .await?;

    let version_id = format!("av_{}", Uuid::new_v4());
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO artifact_versions (id, artifact_id, content, version, from_chat, created_at)
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&version_id)
    .bind(artifact_id)
    .bind(content)
    .bind(next_version)
    .bind(if from_chat { 1 } else { 0 })
    .bind(&now)
    .execute(pool)
    .await?;

    sqlx::query("UPDATE artifacts SET content = ? WHERE id = ?")
        .bind(content)
        .bind(artifact_id)
        .execute(pool)
        .await?;

    let _ = artifact;

    Ok(ArtifactVersion {
        id: version_id,
        artifact_id: artifact_id.to_string(),
        content: content.to_string(),
        version: next_version,
        from_chat,
        created_at: now,
    })
}

pub async fn create_for_chat(
    pool: &SqlitePool,
    chat_id: &str,
    title: &str,
) -> anyhow::Result<Artifact> {
    let id = format!("art_{}", Uuid::new_v4());
    let now = chrono::Utc::now().to_rfc3339();

    sqlx::query(
        "INSERT INTO artifacts (id, chat_id, title, content, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(chat_id)
    .bind(title)
    .bind("")
    .bind(&now)
    .execute(pool)
    .await?;

    sqlx::query("UPDATE chats SET artifact_id = ? WHERE id = ?")
        .bind(&id)
        .bind(chat_id)
        .execute(pool)
        .await?;

    let version_id = format!("av_{}", Uuid::new_v4());
    sqlx::query(
        "INSERT INTO artifact_versions (id, artifact_id, content, version, from_chat, created_at)
         VALUES (?, ?, ?, 1, 0, ?)",
    )
    .bind(&version_id)
    .bind(&id)
    .bind("")
    .bind(&now)
    .execute(pool)
    .await?;

    get(pool, &id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Artifact not found after create"))
}
