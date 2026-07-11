pub mod chunk;
pub mod embed_hash;
pub mod embedder;
pub mod fts;
pub mod index;
pub mod search;
pub mod sources;

pub use embed_hash::EMBED_DIM;
pub use embedder::{
    active_embedder_version, cosine_similarity, embed_passages_sync, embed_query_sync,
    embedding_from_bytes, embedding_to_bytes, EMBEDDER_VERSION,
    FASTEMBED_VERSION, HASH_EMBEDDER_VERSION,
};

#[cfg(test)]
mod tests;

use sqlx::SqlitePool;

/// Collect unique document IDs from the current message and chat history.
pub fn collect_document_ids(
    current_attachments: &[String],
    history_attachments: impl Iterator<Item = impl AsRef<[String]>>,
) -> Vec<String> {
    let mut ids: Vec<String> = current_attachments.to_vec();
    for attachments in history_attachments {
        for id in attachments.as_ref() {
            if !ids.contains(id) {
                ids.push(id.clone());
            }
        }
    }
    ids
}

pub async fn is_document_indexed(pool: &SqlitePool, document_id: &str) -> anyhow::Result<bool> {
    Ok(crate::db::repos::chunks::count_for_document(pool, document_id).await? > 0)
}
