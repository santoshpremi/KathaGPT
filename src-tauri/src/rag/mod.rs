pub mod chunk;
pub mod embed;
pub mod index;
pub mod search;

#[cfg(test)]
mod tests;

use sqlx::SqlitePool;

use crate::db::repos::chunks;

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
    Ok(chunks::count_for_document(pool, document_id).await? > 0)
}
