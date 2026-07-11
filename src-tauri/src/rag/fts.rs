use sqlx::SqlitePool;

pub async fn index_chunks(
    pool: &SqlitePool,
    chunk_id: &str,
    document_id: &str,
    content: &str,
) -> anyhow::Result<()> {
    sqlx::query(
        "INSERT INTO document_chunks_fts (chunk_id, document_id, content) VALUES (?, ?, ?)",
    )
    .bind(chunk_id)
    .bind(document_id)
    .bind(content)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn delete_for_document(pool: &SqlitePool, document_id: &str) -> anyhow::Result<()> {
    sqlx::query("DELETE FROM document_chunks_fts WHERE document_id = ?")
        .bind(document_id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn search(
    pool: &SqlitePool,
    query: &str,
    document_ids: &[String],
    limit: usize,
) -> anyhow::Result<Vec<String>> {
    let fts_query = build_fts_query(query);
    if fts_query.is_empty() || document_ids.is_empty() || limit == 0 {
        return Ok(vec![]);
    }

    let placeholders = document_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(", ");

    let sql = format!(
        "SELECT chunk_id
         FROM document_chunks_fts
         WHERE document_chunks_fts MATCH ? AND document_id IN ({placeholders})
         ORDER BY bm25(document_chunks_fts)
         LIMIT ?"
    );

    let mut q = sqlx::query_scalar::<_, String>(&sql).bind(&fts_query);
    for id in document_ids {
        q = q.bind(id);
    }
    q = q.bind(limit as i64);

    Ok(q.fetch_all(pool).await?)
}

fn build_fts_query(query: &str) -> String {
    let tokens: Vec<String> = query
        .split(|c: char| !c.is_alphanumeric())
        .filter(|t| t.len() >= 2)
        .map(|t| format!("\"{}\"", t.replace('"', "")))
        .collect();

    if tokens.is_empty() {
        return String::new();
    }

    tokens.join(" OR ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_fts_query_from_words() {
        let q = build_fts_query("What is the Aurora budget?");
        assert!(q.contains("Aurora"));
        assert!(q.contains("OR"));
    }

    #[test]
    fn skips_single_char_tokens() {
        assert!(build_fts_query("a b cd").contains("cd"));
        assert!(!build_fts_query("a b").contains("OR"));
    }
}
