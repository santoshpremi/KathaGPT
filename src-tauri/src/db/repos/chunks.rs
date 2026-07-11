use sqlx::SqlitePool;

use crate::rag::{embedding_from_bytes, embedding_to_bytes, EMBED_DIM};

#[derive(Debug, Clone)]
pub struct ChunkRecord {
    pub id: String,
    pub document_id: String,
    pub chunk_index: i64,
    pub content: String,
    pub token_count: i64,
    pub embedding: Vec<f32>,
    pub embedder_version: String,
}

pub async fn delete_for_document(pool: &SqlitePool, document_id: &str) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM document_chunks WHERE document_id = ?")
        .bind(document_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn insert_batch(pool: &SqlitePool, chunks: &[ChunkRecord], created_at: &str) -> anyhow::Result<()> {
    for chunk in chunks {
        let blob = embedding_to_bytes(&chunk.embedding);
        sqlx::query(
            "INSERT INTO document_chunks
             (id, document_id, chunk_index, content, token_count, embedding, embedder_version, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(&chunk.id)
        .bind(&chunk.document_id)
        .bind(chunk.chunk_index)
        .bind(&chunk.content)
        .bind(chunk.token_count)
        .bind(blob)
        .bind(&chunk.embedder_version)
        .bind(created_at)
        .execute(pool)
        .await?;
    }
    Ok(())
}

pub async fn list_for_documents(
    pool: &SqlitePool,
    document_ids: &[String],
) -> anyhow::Result<Vec<ChunkRecord>> {
    if document_ids.is_empty() {
        return Ok(vec![]);
    }

    let placeholders = document_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(", ");

    let sql = format!(
        "SELECT id, document_id, chunk_index, content, token_count, embedding, embedder_version
         FROM document_chunks WHERE document_id IN ({placeholders})
         ORDER BY document_id, chunk_index"
    );

    let mut query = sqlx::query_as::<_, (String, String, i64, String, i64, Vec<u8>, String)>(&sql);
    for id in document_ids {
        query = query.bind(id);
    }

    let rows = query.fetch_all(pool).await?;
    Ok(rows
        .into_iter()
        .map(|(id, document_id, chunk_index, content, token_count, blob, embedder_version)| {
            let embedding = embedding_from_bytes(&blob);
            debug_assert_eq!(embedding.len(), EMBED_DIM);
            ChunkRecord {
                id,
                document_id,
                chunk_index,
                content,
                token_count,
                embedding,
                embedder_version,
            }
        })
        .collect())
}

pub async fn count_for_document(pool: &SqlitePool, document_id: &str) -> anyhow::Result<i64> {
    let row: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM document_chunks WHERE document_id = ?",
    )
    .bind(document_id)
    .fetch_one(pool)
    .await?;
    Ok(row.0)
}

pub async fn total_chunks(pool: &SqlitePool) -> anyhow::Result<i64> {
    let row: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM document_chunks")
        .fetch_one(pool)
        .await?;
    Ok(row.0)
}

pub async fn list_indexed_documents(pool: &SqlitePool) -> anyhow::Result<Vec<(String, String, i64)>> {
    let rows: Vec<(String, String, i64)> = sqlx::query_as(
        "SELECT d.id, d.file_name, COUNT(c.id) as chunk_count
         FROM documents d
         INNER JOIN document_chunks c ON c.document_id = d.id
         GROUP BY d.id
         HAVING chunk_count > 0
         ORDER BY d.created_at DESC",
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn get_storage_path(pool: &SqlitePool, document_id: &str) -> anyhow::Result<Option<String>> {
    let row: Option<(String,)> =
        sqlx::query_as("SELECT storage_path FROM documents WHERE id = ?")
            .bind(document_id)
            .fetch_optional(pool)
            .await?;
    Ok(row.map(|r| r.0))
}

pub async fn delete_document(pool: &SqlitePool, document_id: &str) -> anyhow::Result<bool> {
    delete_for_document(pool, document_id).await?;
    let result = sqlx::query("DELETE FROM documents WHERE id = ?")
        .bind(document_id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}
