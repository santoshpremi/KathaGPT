use sqlx::SqlitePool;
use tracing::info;

use crate::db::repos::chunks::{self, ChunkRecord};
use crate::rag::chunk;
use crate::rag::embedder::{self, active_embedder_version};
use crate::tokens;

pub async fn index_document(pool: &SqlitePool, document_id: &str, text: &str) -> anyhow::Result<usize> {
    chunks::delete_for_document(pool, document_id).await?;

    let parts = chunk::chunk_text(text);
    if parts.is_empty() {
        return Ok(0);
    }

    let embeddings = tokio::task::spawn_blocking({
        let parts = parts.clone();
        move || embedder::embed_passages_sync(&parts)
    })
    .await?;

    let now = chrono::Utc::now().to_rfc3339();
    let mut records = Vec::with_capacity(parts.len());

    for (i, (content, embedding)) in parts.iter().zip(embeddings.iter()).enumerate() {
        let id = format!("chunk_{}", uuid::Uuid::new_v4());
        records.push(ChunkRecord {
            id,
            document_id: document_id.to_string(),
            chunk_index: i as i64,
            content: content.clone(),
            token_count: tokens::estimate_tokens(content),
            embedding: embedding.clone(),
            embedder_version: active_embedder_version().to_string(),
        });
    }

    let count = records.len();
    chunks::insert_batch(pool, &records, &now).await?;
    info!("Indexed {count} chunks for {document_id} ({})", active_embedder_version());
    Ok(count)
}
