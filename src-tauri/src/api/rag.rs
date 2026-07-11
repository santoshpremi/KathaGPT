use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use chrono::Utc;

use crate::db::repos::chunks;
use crate::server::AppState;

pub fn routes() -> Router<AppState> {
    Router::new().route("/rag/collections", get(list_collections))
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
                .map(|(id, name, chunk_count)| KnowledgeCollection {
                    id: id.clone(),
                    name: name.clone(),
                    description: Some(format!("{chunk_count} indexed chunks")),
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
