-- Hybrid RAG: FTS5 keyword index + persist rag source metadata on messages

CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts USING fts5(
    chunk_id UNINDEXED,
    document_id UNINDEXED,
    content,
    tokenize='porter unicode61'
);

ALTER TABLE messages ADD COLUMN rag_sources TEXT;

-- Backfill FTS from existing chunks (safe to re-run: fts is empty on first create)
INSERT INTO document_chunks_fts (chunk_id, document_id, content)
SELECT id, document_id, content FROM document_chunks
WHERE id NOT IN (SELECT chunk_id FROM document_chunks_fts);
