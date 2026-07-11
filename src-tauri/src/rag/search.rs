use std::collections::HashMap;

use sqlx::SqlitePool;

use crate::db::repos::{chunks, documents as doc_repo};
use crate::rag::embedder::{self, cosine_similarity};
use crate::rag::fts;

pub const DEFAULT_TOP_K: usize = 6;
const RRF_K: f32 = 60.0;
const CANDIDATE_MULTIPLIER: usize = 4;

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

    let by_id: HashMap<String, &chunks::ChunkRecord> =
        stored.iter().map(|c| (c.id.clone(), c)).collect();

    let candidate_limit = (top_k * CANDIDATE_MULTIPLIER).max(top_k);

    let vector_ranked = vector_search(&stored, query, candidate_limit).await?;
    let keyword_ranked = fts::search(pool, query, document_ids, candidate_limit).await?;

    let merged_ids = reciprocal_rank_fusion(&vector_ranked, &keyword_ranked, top_k);

    let mut results = Vec::with_capacity(merged_ids.len());
    for (i, chunk_id) in merged_ids.into_iter().enumerate() {
        let Some(chunk) = by_id.get(&chunk_id) else {
            continue;
        };
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
            score: 1.0 / (i as f32 + 1.0),
            source_number: i + 1,
        });
    }

    Ok(results)
}

async fn vector_search(
    stored: &[chunks::ChunkRecord],
    query: &str,
    limit: usize,
) -> anyhow::Result<Vec<String>> {
    let query_vec = tokio::task::spawn_blocking({
        let q = query.to_string();
        move || embedder::embed_query_sync(&q)
    })
    .await?;

    let mut scored: Vec<(f32, String)> = stored
        .iter()
        .map(|c| (cosine_similarity(&query_vec, &c.embedding), c.id.clone()))
        .filter(|(score, _)| *score > 0.0)
        .collect();

    scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
    scored.truncate(limit);
    Ok(scored.into_iter().map(|(_, id)| id).collect())
}

fn reciprocal_rank_fusion(
    vector_ranked: &[String],
    keyword_ranked: &[String],
    top_k: usize,
) -> Vec<String> {
    let mut scores: HashMap<String, f32> = HashMap::new();

    for (rank, id) in vector_ranked.iter().enumerate() {
        *scores.entry(id.clone()).or_default() +=
            1.0 / (RRF_K + rank as f32 + 1.0);
    }
    for (rank, id) in keyword_ranked.iter().enumerate() {
        *scores.entry(id.clone()).or_default() +=
            1.0 / (RRF_K + rank as f32 + 1.0);
    }

    let mut ranked: Vec<(String, f32)> = scores.into_iter().collect();
    ranked.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    ranked
        .into_iter()
        .take(top_k)
        .map(|(id, _)| id)
        .collect()
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

    #[test]
    fn rrf_prefers_chunks_in_both_lists() {
        let vector = vec!["a".into(), "b".into(), "c".into()];
        let keyword = vec!["b".into(), "d".into()];
        let merged = reciprocal_rank_fusion(&vector, &keyword, 3);
        assert_eq!(merged[0], "b");
    }
}
