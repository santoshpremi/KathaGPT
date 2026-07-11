use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};

use fastembed::{EmbeddingModel, InitOptions, TextEmbedding};
use tracing::{info, warn};

use super::embed_hash;

pub const FASTEMBED_VERSION: &str = "fastembed-all-MiniLM-L6-v2";
pub const HASH_EMBEDDER_VERSION: &str = "hash_v1";

/// Legacy alias — prefer `active_embedder_version()` for runtime reporting.
pub const EMBEDDER_VERSION: &str = FASTEMBED_VERSION;

pub fn active_embedder_version() -> &'static str {
    if fastembed_loaded() {
        FASTEMBED_VERSION
    } else {
        HASH_EMBEDDER_VERSION
    }
}

/// Load the embedding model early (call from app startup).
pub fn warmup() {
    let _ = ensure_model();
}

fn fastembed_cache_dir() -> PathBuf {
    let dir = crate::config::app_data_dir()
        .map(|d| d.join("embeddings"))
        .unwrap_or_else(|_| std::env::temp_dir().join("kathagpt-embeddings"));
    if let Err(err) = std::fs::create_dir_all(&dir) {
        warn!("Could not create embedding cache dir {}: {err}", dir.display());
    }
    dir
}

fn build_init_options() -> InitOptions {
    InitOptions::new(EmbeddingModel::AllMiniLML6V2)
        .with_cache_dir(fastembed_cache_dir())
        .with_show_download_progress(false)
}

fn fastembed_loaded() -> bool {
    let guard = match model_slot().lock() {
        Ok(g) => g,
        Err(_) => return false,
    };
    if guard.is_none() {
        drop(guard);
        let _ = ensure_model();
        let Ok(g) = model_slot().lock() else {
            return false;
        };
        return g.is_some();
    }
    guard.is_some()
}

static FASTEMBED: OnceLock<Mutex<Option<TextEmbedding>>> = OnceLock::new();

fn model_slot() -> &'static Mutex<Option<TextEmbedding>> {
    FASTEMBED.get_or_init(|| Mutex::new(None))
}

fn ensure_model() -> Option<std::sync::MutexGuard<'static, Option<TextEmbedding>>> {
    let mut guard = model_slot().lock().ok()?;
    if guard.is_none() {
        match TextEmbedding::try_new(build_init_options()) {
            Ok(model) => {
                info!("fastembed model loaded ({FASTEMBED_VERSION})");
                *guard = Some(model);
            }
            Err(err) => {
                warn!("fastembed unavailable, using hash fallback: {err}");
            }
        }
    }
    Some(guard)
}

pub fn embed_passages_sync(texts: &[String]) -> Vec<Vec<f32>> {
    if texts.is_empty() {
        return vec![];
    }

    if let Some(mut guard) = ensure_model() {
        if let Some(model) = guard.as_mut() {
            let prefixed: Vec<String> = texts
                .iter()
                .map(|t| format!("passage: {t}"))
                .collect();
            if let Ok(embeddings) = model.embed(prefixed, None) {
                return embeddings;
            }
        }
    }

    texts.iter().map(|t| embed_hash::embed_text(t)).collect()
}

pub fn embed_query_sync(query: &str) -> Vec<f32> {
    if let Some(mut guard) = ensure_model() {
        if let Some(model) = guard.as_mut() {
            let prefixed = format!("query: {query}");
            if let Ok(embeddings) = model.embed(vec![prefixed], None) {
                if let Some(e) = embeddings.into_iter().next() {
                    return e;
                }
            }
        }
    }
    embed_hash::embed_text(query)
}

pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    let mut dot = 0f32;
    let mut na = 0f32;
    let mut nb = 0f32;
    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
        na += x * x;
        nb += y * y;
    }
    if na == 0.0 || nb == 0.0 {
        0.0
    } else {
        dot / (na.sqrt() * nb.sqrt())
    }
}

pub fn embedding_to_bytes(vec: &[f32]) -> Vec<u8> {
    vec.iter().flat_map(|f| f.to_le_bytes()).collect()
}

pub fn embedding_from_bytes(bytes: &[u8]) -> Vec<f32> {
    bytes
        .chunks_exact(4)
        .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn passage_embeddings_match_dimension() {
        let texts = vec!["revenue Q3 growth".to_string(), "weather sunny".to_string()];
        let embeddings = embed_passages_sync(&texts);
        assert_eq!(embeddings.len(), 2);
        assert_eq!(embeddings[0].len(), embed_hash::EMBED_DIM);
    }

    #[test]
    fn query_embedding_matches_dimension() {
        let e = embed_query_sync("what is revenue");
        assert_eq!(e.len(), embed_hash::EMBED_DIM);
    }
}
