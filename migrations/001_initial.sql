-- KathaGPT Local Edition — initial schema (v1)

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS provider_keys (
    provider   TEXT PRIMARY KEY,
    api_key    TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profile (
    id                  TEXT PRIMARY KEY,
    first_name          TEXT,
    last_name           TEXT,
    email               TEXT,
    locale              TEXT NOT NULL DEFAULT 'en',
    default_model       TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    accepted_guidelines INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
    id                         TEXT PRIMARY KEY,
    name                       TEXT,
    model_override             TEXT,
    rag_mode                   TEXT NOT NULL DEFAULT 'OFF',
    custom_source_id           TEXT,
    custom_system_prompt_suffix TEXT,
    artifact_id                TEXT,
    hidden                     INTEGER NOT NULL DEFAULT 0,
    created_at                 TEXT NOT NULL,
    updated_at                 TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id                  TEXT PRIMARY KEY,
    chat_id             TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    from_ai             INTEGER NOT NULL,
    generation_model    TEXT,
    response_completed  INTEGER NOT NULL DEFAULT 1,
    cancelled           INTEGER NOT NULL DEFAULT 0,
    attachment_ids      TEXT,
    citations           TEXT,
    error_code          TEXT,
    created_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at);

CREATE TABLE IF NOT EXISTS workflows (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    description   TEXT,
    department_id TEXT NOT NULL DEFAULT 'personal',
    index_pos     INTEGER NOT NULL DEFAULT 0,
    steps         TEXT NOT NULL,
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_favorites (
    workflow_id TEXT PRIMARY KEY REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artifacts (
    id         TEXT PRIMARY KEY,
    chat_id    TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artifact_versions (
    id          TEXT PRIMARY KEY,
    artifact_id TEXT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    version     INTEGER NOT NULL,
    from_chat   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_keys (
    id           TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    key_hash     TEXT NOT NULL,
    created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
);
