-- Track which embedding model produced each chunk (for re-indexing on model upgrades)
ALTER TABLE document_chunks ADD COLUMN embedder_version TEXT NOT NULL DEFAULT 'hash_v1';
