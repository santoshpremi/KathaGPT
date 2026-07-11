use sqlx::SqlitePool;

use crate::db::repos::{chunks, documents as doc_repo};
use crate::rag::embed::{self, cosine_similarity};

pub const DEFAULT_TOP_K: usize = 6;

#[derive(Debug, Clone)]
pub struct RetrievedChunk {
    pub chunk_id: String,
    pub document_id: String,
    pub file_name: String,
    pub chunk_index: i64,
    pub content: String,
    pub score: f32,
    pub source_number: usize,
}

pub async fn retrieve(
    pool: &SqlitePool,
    query: &str,
    document_ids: &[String],
    top_k: usize,
) -> anyhow::Result<Vec<RetrievedChunk>> {
    if document_ids.is_empty() || query.trim().is_empty() {
        return Ok(vec![]);
    }

    let stored = chunks::list_for_documents(pool, document_ids).await?;
    if stored.is_empty() {
        return Ok(vec![]);
    }

    let query_vec = embed::embed_text(query);
    let mut scored: Vec<(f32, &chunks::ChunkRecord)> = stored
        .iter()
        .map(|c| (cosine_similarity(&query_vec, &c.embedding), c))
        .filter(|(score, _)| *score > 0.0)
        .collect();

    scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
    scored.truncate(top_k);

    let mut results = Vec::with_capacity(scored.len());
    for (i, (score, chunk)) in scored.into_iter().enumerate() {
        let file_name = doc_repo::get(pool, &chunk.document_id)
            .await?
            .map(|d| d.file_name)
            .unwrap_or_else(|| "document".to_string());

        results.push(RetrievedChunk {
            chunk_id: chunk.id.clone(),
            document_id: chunk.document_id.clone(),
            file_name,
            chunk_index: chunk.chunk_index,
            content: chunk.content.clone(),
            score,
            source_number: i + 1,
        });
    }

    Ok(results)
}

pub fn format_rag_context(chunks: &[RetrievedChunk]) -> String {
    if chunks.is_empty() {
        return String::new();
    }

    let mut out = String::from(
        "Relevant excerpts from the user's documents (cite as [1], [2], etc. when used):\n",
    );
    for chunk in chunks {
        out.push_str(&format!(
            "\n[{num}] {file} (chunk {idx}):\n{content}\n",
            num = chunk.source_number,
            file = chunk.file_name,
            idx = chunk.chunk_index + 1,
            content = chunk.content,
        ));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn format_includes_source_numbers() {
        let chunks = vec![RetrievedChunk {
            chunk_id: "c1".into(),
            document_id: "d1".into(),
            file_name: "report.txt".into(),
            chunk_index: 0,
            content: "Revenue grew 15%".into(),
            score: 0.9,
            source_number: 1,
        }];
        let formatted = format_rag_context(&chunks);
        assert!(formatted.contains("[1]"));
        assert!(formatted.contains("Revenue grew 15%"));
    }
}
