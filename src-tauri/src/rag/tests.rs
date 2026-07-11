#[cfg(test)]
mod integration {
    use sqlx::sqlite::SqliteConnectOptions;
    use sqlx::SqlitePool;
    use std::str::FromStr;

    use crate::db::repos::{chunks, documents};
    use crate::rag::{index, search};

    async fn test_pool() -> SqlitePool {
        let options = SqliteConnectOptions::from_str("sqlite::memory:")
            .unwrap()
            .foreign_keys(true);
        let pool = SqlitePool::connect_with(options).await.unwrap();
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY, file_name TEXT NOT NULL, file_type TEXT NOT NULL,
                original_size INTEGER NOT NULL, content_length INTEGER NOT NULL,
                tokens INTEGER NOT NULL DEFAULT 0, storage_path TEXT NOT NULL,
                uploaded_by_id TEXT NOT NULL DEFAULT 'local-user', created_at TEXT NOT NULL
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS document_chunks (
                id TEXT PRIMARY KEY, document_id TEXT NOT NULL, chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL, token_count INTEGER NOT NULL, embedding BLOB NOT NULL,
                embedder_version TEXT NOT NULL DEFAULT 'hash_v1',
                created_at TEXT NOT NULL
            )",
        )
        .execute(&pool)
        .await
        .unwrap();
        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON document_chunks(document_id)",
        )
        .execute(&pool)
        .await
        .unwrap();
        pool
    }

    #[tokio::test]
    async fn index_and_retrieve_finds_relevant_chunk() {
        let pool = test_pool().await;
        let doc_id = "doc_test1";
        let now = chrono::Utc::now().to_rfc3339();

        let record = documents::DocumentRecord {
            id: doc_id.into(),
            file_name: "report.txt".into(),
            file_type: "text/plain".into(),
            original_size: 100,
            content_length: 80,
            tokens: 20,
            uploaded_by_id: "local-user".into(),
            created_at: now.clone(),
        };
        documents::insert(&pool, &record, "/tmp/report.txt").await.unwrap();

        let text = "Project Aurora budget is 2.5 million. Weather forecast is sunny.";
        let count = index::index_document(&pool, doc_id, text).await.unwrap();
        assert!(count >= 1);

        let stored = chunks::count_for_document(&pool, doc_id).await.unwrap();
        assert_eq!(stored, count as i64);

        let results = search::retrieve(
            &pool,
            "What is the Aurora project budget?",
            &vec![doc_id.into()],
            3,
        )
        .await
        .unwrap();
        assert!(!results.is_empty());
        assert!(results[0].content.contains("Aurora"));
    }
}
