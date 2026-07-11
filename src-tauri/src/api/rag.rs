use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use chrono::Utc;

use crate::db::repos::chunks;
use crate::rag::{active_embedder_version, search, FASTEMBED_VERSION, HASH_EMBEDDER_VERSION};
use crate::server::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/rag/collections", get(list_collections))
        .route("/rag/status", get(rag_status))
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct KnowledgeCollection {
    id: String,
    name: String,
    description: Option<String>,
    created_at: String,
    updated_at: String,
}

async fn list_collections(State(state): State<AppState>) -> impl IntoResponse {
    match chunks::list_indexed_documents(&state.db).await {
        Ok(rows) => {
            let collections: Vec<KnowledgeCollection> = rows
                .into_iter()
                .map(|(id, name, chunk_count, embedder_version)| KnowledgeCollection {
                    id: id.clone(),
                    name: name.clone(),
                    description: Some(format!("{chunk_count} chunks · {embedder_version}")),
                    created_at: Utc::now().to_rfc3339(),
                    updated_at: Utc::now().to_rfc3339(),
                })
                .collect();
            (StatusCode::OK, Json(collections)).into_response()
        }
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": err.to_string() })),
        )
            .into_response(),
    }
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct RagStatus {
    embedder: &'static str,
    total_chunks: i64,
    indexed_documents: usize,
    top_k: usize,
    search_mode: &'static str,
    hash_chunks: i64,
    needs_reindex: bool,
}

async fn rag_status(State(state): State<AppState>) -> impl IntoResponse {
    match chunks::list_indexed_documents(&state.db).await {
        Ok(docs) => {
            let total_chunks = chunks::total_chunks(&state.db).await.unwrap_or(0);
            let hash_chunks = chunks::count_by_embedder(&state.db, HASH_EMBEDDER_VERSION)
                .await
                .unwrap_or(0);
            let active = active_embedder_version();
            (
                StatusCode::OK,
                Json(RagStatus {
                    embedder: active,
                    total_chunks,
                    indexed_documents: docs.len(),
                    top_k: search::DEFAULT_TOP_K,
                    search_mode: "hybrid",
                    hash_chunks,
                    needs_reindex: active == FASTEMBED_VERSION && hash_chunks > 0,
                }),
            )
                .into_response()
        }
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": err.to_string() })),
        )
            .into_response(),
    }
}
