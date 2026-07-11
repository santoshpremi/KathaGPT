use serde_json::json;

use super::search::RetrievedChunk;

/// Build `ragSources` payloads for the frontend citation UI.
pub fn chunks_to_rag_sources(chunks: &[RetrievedChunk], query: &str) -> Vec<serde_json::Value> {
    use std::collections::HashMap;

    let mut by_document: HashMap<String, Vec<&RetrievedChunk>> = HashMap::new();
    for chunk in chunks {
        by_document
            .entry(chunk.document_id.clone())
            .or_default()
            .push(chunk);
    }

    by_document
        .into_iter()
        .map(|(document_id, doc_chunks)| {
            let file_name = doc_chunks
                .first()
                .map(|c| c.file_name.as_str())
                .unwrap_or("document");

            let result_components: Vec<serde_json::Value> = doc_chunks
                .iter()
                .map(|c| {
                    json!({
                        "score": c.score,
                        "result": c.content,
                        "documentTitle": c.file_name,
                        "documentId": c.document_id,
                        "sourceNumber": c.source_number,
                    })
                })
                .collect();

            json!({
                "id": format!("rag_{document_id}"),
                "knowledgeCollectionId": document_id,
                "queries": [query],
                "resultComponents": result_components,
                "name": file_name,
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rag::search::RetrievedChunk;

    #[test]
    fn groups_chunks_by_document() {
        let chunks = vec![
            RetrievedChunk {
                chunk_id: "c1".into(),
                document_id: "doc_a".into(),
                file_name: "a.txt".into(),
                chunk_index: 0,
                content: "alpha".into(),
                score: 0.9,
                source_number: 1,
            },
            RetrievedChunk {
                chunk_id: "c2".into(),
                document_id: "doc_b".into(),
                file_name: "b.txt".into(),
                chunk_index: 0,
                content: "beta".into(),
                score: 0.8,
                source_number: 2,
            },
        ];

        let sources = chunks_to_rag_sources(&chunks, "test query");
        assert_eq!(sources.len(), 2);
        let ids: Vec<_> = sources
            .iter()
            .filter_map(|s| s["knowledgeCollectionId"].as_str())
            .collect();
        assert!(ids.contains(&"doc_a"));
        assert!(ids.contains(&"doc_b"));
    }
}
