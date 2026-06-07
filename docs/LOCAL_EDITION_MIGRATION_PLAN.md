# KathaGPT Local Edition — Full Migration Plan

**Architecture target:** Full Rust backend + React frontend + Tauri shell  
**Product goal:** Open-source, one-click install (Windows / macOS / Linux), API-key-only setup, 100% local data on the user's machine  
**Status:** Phases 0–6 complete (v0.1.0 local edition)

---

## 1. Executive summary

KathaGPT today is already close to a local-first app:

| Layer | Today | Target |
|-------|-------|--------|
| UI | React + Vite + MUI | **Keep React** (served as static files) |
| API | Express + tRPC (Node, port 8003) | **Axum** (Rust, embedded in Tauri process) |
| Persistence | JSON file (`.data/dev-store.json`) | **SQLite** in OS app-data directory |
| LLM routing | OpenRouter + direct providers | **Port to Rust** (`reqwest` + SSE parsing) |
| Desktop | Manual `pnpm dev` | **Tauri v2** — click icon, app opens |
| Distribution | None | GitHub Releases (.dmg, .msi, .AppImage) |

The migration is **incremental**: Rust backend grows module-by-module while React keeps working. The hardest pieces are **streaming chat** (tRPC async generators today) and **replacing the in-memory JSON store** with SQLite.

---

## 2. Target architecture

```
┌─────────────────────────────────────────────────────────────┐
│  KathaGPT.app / KathaGPT.exe                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tauri shell (Rust)                                   │  │
│  │  • Window / tray / deep links                         │  │
│  │  • OS app-data paths                                  │  │
│  │  • API key → OS keychain (optional Phase 6)           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Axum server (same process, localhost:PORT)     │  │  │
│  │  │  • REST / rspc API                              │  │  │
│  │  │  • SSE streaming (chat + artifacts)             │  │  │
│  │  │  • Serves dist/ (React build)                   │  │  │
│  │  │  • SQLite (rusqlite / sqlx)                     │  │  │
│  │  │  • LLM providers (reqwest)                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  WebView → React UI                             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼ (HTTPS only for LLM calls)
   OpenRouter / OpenAI / Anthropic / Gemini / Perplexity
```

**Data on disk (per OS):**

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/KathaGPT/` |
| Windows | `%APPDATA%\KathaGPT\` |
| Linux | `~/.local/share/KathaGPT/` |

Contents: `kathagpt.db` (SQLite), `logs/`, optional `exports/`.

---

## 3. Current codebase inventory

### 3.1 Backend modules to port

| Module | Files | Complexity | Notes |
|--------|-------|------------|-------|
| **Store / persistence** | `devStore.ts`, `persistence.ts`, `seed.ts` | High | 20+ functions; JSON → SQLite |
| **Provider keys** | `providerKeys.ts` | Medium | 5 providers; encrypt at rest later |
| **LLM routing** | `modelProviders.ts`, `streamCompletion.ts`, `openrouterModels.ts` | High | OpenRouter-first; SSE streams |
| **LLM providers** | `providers/sseOpenAI.ts`, `anthropic.ts`, `gemini.ts` | High | Port SSE parsers to Rust |
| **tRPC router** | `trpc.ts` (~700 lines) | High | 15+ sub-routers |
| **Express server** | `server.ts` | Low | Static files + middleware |
| **Model metadata** | `llmMeta.ts` | Medium | Large config object → JSON/Rust struct |
| **Workflows** | `workflowTypes.ts` + store fns | Medium | Steps, favorites, departments |
| **Artifacts** | store fns + `artifact.createVersion` stream | High | Streaming revision |
| **RAG / data pools** | `dataPoolTypes.ts` | Low (stub) | Stub today; defer or simplify |
| **Credits / trial** | `credits/`, `trial` router | Low | **Remove** for Local Edition |

### 3.2 tRPC API surface (must reimplement)

| Router | Procedures | Priority |
|--------|------------|----------|
| `message` | `postMessageAndRequestResponse` (stream), `getMessagesForChat`, `abortMessageResponse`, `deleteMessagesFollowing` | **P0** |
| `chat` | `create`, `get`, `getAll`, `delete`, `setModelOverride`, `adjustChatTitle`, `setRagMode` | **P0** |
| `providerKeys` | `getStatus`, `setKey`, `clearKey`, `testConnection` | **P0** |
| `modelConfig` | `getEnabled`, `getAvailable` | **P0** |
| `user` | `me` | **P1** |
| `organization` | `getOrganization`, `updateOrganization` | **P1** (simplify to single local profile) |
| `workflows` | `getAll`, `getById`, `create`, `update`, `favorites`, `toggleFavorite`, `wizard` | **P1** |
| `artifact` | `getArtifact`, `getVersion`, `createVersion` (stream) | **P2** |
| `apiKeys` | developer tokens | **P2** |
| `usageGuidelines` | get/update | **P3** |
| `tools` | feature flags (image, translate, etc.) | **P3** (static config in Local Edition) |
| `rag` | data pools | **P4** (future) |
| `trial`, `organizationMetrics` | — | **Remove** |

### 3.3 Frontend (keep, adapt)

| Area | Files | Changes needed |
|------|-------|----------------|
| Chat UI | `ChatInterface.tsx`, `ChatInput.tsx`, `TextMessage.tsx` | Point API client to Rust backend |
| Model selector | `InlineModelSelector.tsx` | Provider groups already done |
| API keys modal | `+apiKeys.tsx` | Same UX; new client |
| Sidebar / workflows | `Sidebar.tsx`, `WorkflowsTree.tsx`, etc. | Remove trial/org complexity |
| tRPC client | `TrpcProvider.tsx`, `trpc.ts` | Replace with rspc or fetch+types |
| Routes | 22 page files | Simplify `/:organizationId` → `/` for local |
| i18n | `locales/*.json` | Keep; trim enterprise keys |

**~35 files** call `trpc.*` — client swap is a focused migration.

### 3.4 Express REST stubs (port or drop)

| Endpoint | Action |
|----------|--------|
| `GET /api/health` | Port to Axum |
| `GET/PATCH /api/organizations/:id/users/me` | Simplify to `GET/PATCH /api/user` |
| `POST /api/auth/logout` | Drop (no auth in local) |
| `POST /api/analytics/event` | Drop or local-only log |
| `POST /api/trial/extend` | **Remove** |

---

## 4. Technology choices (Rust crate stack)

### 4.1 Core

| Concern | Crate | Why |
|---------|-------|-----|
| HTTP server | `axum` 0.7+ | Async, SSE, middleware, static files |
| Async runtime | `tokio` | Standard; Tauri already uses it |
| Database | `sqlx` + `sqlite` | Async queries, migrations |
| Migrations | `sqlx-cli` or `refinery` | Versioned schema |
| HTTP client (LLM) | `reqwest` | SSE streaming via `bytes` |
| Serialization | `serde`, `serde_json` | API + DB |
| IDs | `uuid`, `cuid2` (or `nanoid`) | Match current ID formats |
| Errors | `thiserror`, `anyhow` | Clean error types |
| Logging | `tracing`, `tracing-subscriber` | File + stdout in dev |
| Config | `directories` | OS app-data paths |
| Time | `chrono` | Timestamps |

### 4.2 Tauri

| Concern | Approach |
|---------|----------|
| Version | **Tauri v2** |
| Backend in same process | Spawn Axum on `127.0.0.1:0` (random free port), pass port to WebView |
| Dev mode | `tauri dev` runs Vite + Rust; WebView proxies to Vite in dev |
| Production | Embed `dist/` in app bundle; Axum serves it |

### 4.3 API layer (replace tRPC)

**Recommended: `rspc`** — Rust equivalent of tRPC; supports subscriptions and typed clients.

| Option | Pros | Cons |
|--------|------|------|
| **rspc** | Type-safe; closest to current tRPC DX | Younger ecosystem; streaming needs design |
| **REST + OpenAPI (`utoipa`)** | Simple; easy SSE endpoints | More boilerplate; manual TS types |
| **JSON-RPC** | Lightweight | No streaming standard |

**Hybrid (recommended):**

- **rspc** for queries + mutations (chat list, settings, provider keys)
- **Dedicated SSE routes** for streaming:
  - `POST /api/chat/:id/message/stream`
  - `POST /api/artifact/:id/revision/stream`

This mirrors how tRPC splits streaming today (`unstable_httpBatchStreamLink` vs `httpLink`).

### 4.4 Type sharing (Rust → TypeScript)

| Tool | Use |
|------|-----|
| `typeshare` or `ts-rs` | Generate TS types from Rust structs |
| `rspc` client generator | Auto-generate React hooks |

---

## 5. Target repository structure

```
KathaGPT/
├── src/                          # React frontend (keep)
├── src-tauri/                    # NEW — Tauri + Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── capabilities/
│   ├── icons/
│   └── src/
│       ├── main.rs               # Tauri entry; starts Axum
│       ├── lib.rs
│       ├── server/
│       │   ├── mod.rs
│       │   ├── routes.rs         # Axum router
│       │   ├── sse.rs            # Streaming handlers
│       │   └── static.rs         # Serve dist/
│       ├── api/
│       │   ├── mod.rs
│       │   ├── chat.rs
│       │   ├── message.rs
│       │   ├── workflow.rs
│       │   ├── artifact.rs
│       │   ├── provider_keys.rs
│       │   ├── model_config.rs
│       │   └── user.rs
│       ├── db/
│       │   ├── mod.rs
│       │   ├── pool.rs
│       │   ├── migrations/
│       │   └── repos/            # chat_repo, message_repo, etc.
│       ├── llm/
│       │   ├── mod.rs
│       │   ├── router.rs         # OpenRouter-first routing
│       │   ├── openrouter.rs
│       │   ├── openai.rs
│       │   ├── anthropic.rs
│       │   ├── gemini.rs
│       │   ├── perplexity.rs
│       │   └── sse_parser.rs
│       ├── models/               # Serde structs (shared domain)
│       └── config.rs             # App paths, defaults
├── packages/
│   └── api-types/                # Keep temporarily; replace with generated types
├── migrations/                   # SQLite migrations (sqlx)
├── docs/
│   └── LOCAL_EDITION_MIGRATION_PLAN.md  # this file
├── backend/                      # OLD Node backend — delete after parity
├── .github/workflows/
│   ├── release.yml               # Build Win/Mac/Linux
│   └── ci.yml
├── LICENSE                       # MIT or Apache-2.0
└── README.md                     # Open-source README
```

---

## 6. SQLite schema (v1)

```sql
-- migrations/001_initial.sql

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE provider_keys (
  provider TEXT PRIMARY KEY,  -- openrouter | openai | anthropic | gemini | perplexity
  api_key  TEXT NOT NULL,     -- encrypt in v2
  updated_at TEXT NOT NULL
);

CREATE TABLE user_profile (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  locale TEXT DEFAULT 'en',
  default_model TEXT DEFAULT 'gpt-4o-mini',
  accepted_guidelines INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  name TEXT,
  model_override TEXT,
  rag_mode TEXT DEFAULT 'OFF',
  custom_source_id TEXT,
  custom_system_prompt_suffix TEXT,
  artifact_id TEXT,
  hidden INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  from_ai INTEGER NOT NULL,
  generation_model TEXT,
  response_completed INTEGER DEFAULT 1,
  cancelled INTEGER DEFAULT 0,
  attachment_ids TEXT,  -- JSON array
  citations TEXT,       -- JSON array
  error_code TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);

CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id TEXT DEFAULT 'personal',
  index_pos INTEGER DEFAULT 0,
  steps TEXT NOT NULL,  -- JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE workflow_favorites (
  workflow_id TEXT PRIMARY KEY REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE artifact_versions (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  from_chat INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

**Migration from JSON:** One-time import tool (`kathagpt import-legacy --from .data/dev-store.json`) on first launch if old file detected.

---

## 7. Phased migration plan

### Phase 0 — Foundation & scope (2–3 weeks)

**Goals:** Repo structure, Local Edition scope, CI skeleton.

- [x] Add `src-tauri/` with Tauri v2 + Axum server on `127.0.0.1:17890`
- [x] Add `LICENSE` (MIT), `README.md`
- [x] Set up `sqlx` + `migrations/001_initial.sql`
- [x] CI: `.github/workflows/rust.yml` (clippy + build + test)
- [x] Standalone API binary: `pnpm local:api` → `GET /api/local/health`
- [x] Define **Local Edition feature matrix** — see `docs/LOCAL_EDITION_FEATURES.md`
- [x] `dev:tauri-prep` starts Vite + Node backend for `pnpm tauri:dev`
- [ ] `pnpm tauri:dev` smoke test on target OS (manual)
- [x] Playwright `test/e2e/local-api.spec.ts` for Rust endpoints

**Local Edition — ship:**

- Chat (create, send, stream, delete, edit/regenerate)
- Model selector (provider groups)
- API keys (OpenRouter + direct providers)
- Workflows (basic CRUD + run)
- Artifacts (basic)
- i18n (en + fallbacks)
- First-run onboarding (API key wizard)

**Local Edition — cut:**

- Multi-org / tenant switching
- Trial / phase / credits / upgrade modals
- Academy / e-learning / gamification
- Analytics / Tally
- RAG data pools (defer to v2)
- Enterprise REST stubs

**Frontend simplification:**

- Replace `/:organizationId/...` routes with `/chats/:chatId`, `/workflows`, `/settings`
- Single implicit "local user" — no auth page

---

### Phase 1 — Tauri shell + static UI (2–3 weeks)

**Goals:** Click icon → app opens with React UI (even if API still Node temporarily).

- [x] Tauri config loads React (`dev`: Vite URL; `prod`: embedded `dist/`)
- [x] Axum serves `dist/` when built + health check
- [x] App-data directory created on first run
- [x] System tray (optional): Open, Quit
- [x] Fixed API port `17890`; WebView uses Vite in dev

**Optional bridge:** Run Node backend as sidecar during Phase 1–2 only for faster demo. Remove by Phase 3.

**Exit criteria:** `.app` / `.exe` opens chat UI without terminal.

---

### Phase 2 — Rust data layer (3–4 weeks)

**Goals:** Replace JSON store with SQLite; no LLM yet.

Port `devStore.ts` functions to Rust repos:

| Rust module | Replaces | Status |
|-------------|----------|--------|
| `db/repos/chats.rs` | `createChat`, `listChats`, `deleteChat` | **Done** |
| `db/repos/provider_keys.rs` | `providerKeys.ts` | **Done** |
| `db/repos/user_profile.rs` | `getCurrentUser` (seed) | **Done** |
| `db/repos/messages.rs` | messages | **Done** |
| `db/repos/workflows.rs` | workflows | **Done** |
| `db/repos/artifacts.rs` | artifacts | **Done** |

- [x] JSON → SQLite importer (`db/import.rs`)
- [x] REST routes: provider keys, user, chats
- [ ] Unit/integration tests for each repo
- [ ] Frontend client swap to Rust API

**Exit criteria:** Chats persist across app restarts in SQLite; list/create/delete works from API.

---

### Phase 3 — Rust LLM layer (4–5 weeks)

**Goals:** Streaming chat works entirely in Rust.

Port `backend/src/ai/`:

| Rust module | Replaces |
|-------------|----------|
| `llm/router.rs` | `modelProviders.rs` — OpenRouter-first |
| `llm/openrouter.rs` | OpenRouter SSE via `reqwest` |
| `llm/openai.rs` | `sseOpenAI.ts` |
| `llm/anthropic.rs` | `anthropic.ts` |
| `llm/gemini.rs` | `gemini.ts` |
| `llm/perplexity.rs` | Perplexity (OpenAI-compatible) |
| `llm/sse_parser.rs` | Shared SSE line parser |
| `llm/models.rs` | `llmMeta.ts` + `openrouterModels.ts` |

**Streaming endpoint:**

```
POST /api/chats/:chat_id/messages/stream
Content-Type: application/json
Accept: text/event-stream

Request: { content, model_override?, temperature?, language? }

SSE events:
  event: init
  data: { "ai_message_id": "...", "generation_model": "gpt-4o-mini" }

  event: delta
  data: { "delta": "Hello", "content": "Hello" }

  event: done
  data: { "content": "...", "citations": [] }
```

- [x] `llm/router.rs` — OpenRouter-first routing
- [x] `llm/stream.rs` — SSE streaming (OpenRouter + direct providers + dev fallback)
- [x] `POST /api/local/chats/{id}/messages/stream` — init / delta / done events
- [x] `GET /api/local/chats/{id}/messages`
- [x] `GET /api/local/model-config/enabled` and `/available`
- [x] Legacy message import in `db/import.rs`
- [x] Playwright streaming test in `test/e2e/local-api.spec.ts`
- [ ] Provider key test connection (port `testProviderConnection`) — partial in `provider_keys.rs`
- [ ] Error handling polish + user-facing messages
- [ ] Integration tests with mocked LLM HTTP server

**Exit criteria:** Send "Hi" in Tauri app → streamed response from OpenRouter using saved key. *(Rust API verified via curl/Playwright; frontend still on tRPC.)*

---

### Phase 4 — API parity + frontend client swap (4–6 weeks)

**Goals:** All P0/P1 tRPC procedures implemented in Rust; React uses new client.

**Frontend adapter layer (in progress):**

- [x] `src/lib/api/rust/` — fetch client + SSE streaming
- [x] Dual-mode hooks (Rust when `/api/local/health` OK, else tRPC fallback)
- [x] Provider keys page → Rust API
- [x] Model selector → Rust `model-config`
- [x] Chat list / create / delete → Rust API
- [x] `ChatInterface` message load + SSE streaming → Rust API
- [x] Chat rename, model override, edit/regenerate (delete following)
- [x] Workflows CRUD + favorites (Rust + frontend hooks)
- [x] Artifacts basic CRUD
- [ ] RAG (deferred v2)

**API implementation order:**

1. `providerKeys.*`
2. `modelConfig.*`
3. `message.*` (including SSE)
4. `chat.*`
5. `workflows.*`
6. `artifact.*` (SSE for `createVersion`)
7. `usageGuidelines.*`, `productConfig.*` (static)

**Frontend client migration:**

| Step | Action |
|------|--------|
| 1 | Add `src/lib/api/rust/` — generated rspc client or fetch wrappers |
| 2 | Create adapter hooks matching current `trpc.*` shape (minimize component churn) |
| 3 | Swap `TrpcProvider` → `ApiProvider` |
| 4 | Update streaming in `ChatInterface.tsx` to consume SSE |
| 5 | Remove `@trpc/*` dependencies |
| 6 | Delete `backend/` Node folder |

**SSE in React (replace tRPC subscription):**

```typescript
// Conceptual
async function* streamMessage(chatId: string, input: SendMessageInput) {
  const res = await fetch(`/api/chats/${chatId}/messages/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const reader = res.body!.getReader();
  // parse SSE lines → yield deltas
}
```

**Exit criteria:** All E2E tests pass against Tauri build; Node backend deleted.

---

### Phase 5 — Local Edition UX polish (3–4 weeks)

**Goals:** Zero-setup experience for non-technical users.

- [x] **First-run wizard:** Welcome → Enter OpenRouter key → Test connection → Done (`/onboarding`)
- [x] **Settings page:** API keys link + data export (`/settings`)
- [x] **Remove enterprise UI:** trial modal removed from layout
- [x] **Simplified routes:** `/chats/:id`, `/workflows`, `/onboarding`, `/settings` (+ legacy org redirects)
- [x] **Data export:** `GET /api/local/data/export` + settings UI
- [x] **Offline behavior:** `OfflineBanner` in layout
- [x] **Lazy-load heavy UI:** Mermaid dynamic import
- [x] **Error toasts:** react-toastify in onboarding + settings

**Exit criteria:** Fresh install → enter key → chat in under 60 seconds, no terminal.

---

### Phase 6 — Security, packaging, open source (3–4 weeks)

**Goals:** Public repo, signed installers, trustworthy privacy story.

**Security:**

- [x] API keys encrypted at rest (AES-256-GCM; key from OS keychain via `keyring` crate)
- [x] Bind Axum to `127.0.0.1` only (never `0.0.0.0`)
- [x] CSP headers for WebView (`tauri.conf.json`)
- [x] No telemetry by default (Plausible inactive without config)
- [x] `SECURITY.md` + threat model document

**Packaging:**

| Platform | Format | Tool |
|----------|--------|------|
| macOS | `.dmg` + notarized `.app` | `tauri build` + Apple notarization |
| Windows | `.msi` or NSIS `.exe` | `tauri build` + optional signing |
| Linux | `.AppImage` + `.deb` | `tauri build` |

**Target sizes:**

| Component | Size |
|-----------|------|
| Tauri + Rust binary | ~8–15 MB |
| React dist | ~10–20 MB |
| **Total installer** | **~25–50 MB** |

**Open source:**

- [ ] Public GitHub repo (user action)
- [x] README: install instructions, privacy statement
- [x] GitHub Actions: `.github/workflows/release.yml` builds 3 platforms on tag
- [ ] GitHub Releases with changelog (on first tag push)
- [ ] Issue templates + roadmap (GitHub Projects)
- [ ] Code of conduct

**Exit criteria:** User downloads from Releases → installs → works. Repo is public.

---

## 8. Frontend route simplification

| Current | Local Edition |
|---------|---------------|
| `/:organizationId/chats/:chatId` | `/chats/:chatId` |
| `/:organizationId/workflows` | `/workflows` |
| `/:organizationId/tools/...` | `/tools/...` |
| `/apiKeys` (modal) | `/settings/api-keys` or keep modal |
| `/:organizationId/onboarding` | `/onboarding` (first run only) |
| `/:organizationId/auth` | **Remove** |

Remove legacy org headers (single local user).

---

## 9. LLM routing rules (port exactly)

Match current `modelProviders.ts` behavior:

1. If **OpenRouter** key is configured → **all models** route through OpenRouter (use `OPENROUTER_MODEL_MAP`)
2. Else → use direct provider key matching model family
3. If no keys → dev fallback string (or onboarding redirect in production)

Provider groups in UI remain for clarity; routing follows rules above.

---

## 10. Testing strategy

| Layer | Tool | What |
|-------|------|------|
| Rust unit | `cargo test` | DB repos, SSE parser, model routing |
| Rust integration | `axum-test` + `wiremock` | API routes, mocked LLM |
| Frontend | Vitest (optional) | Hooks, SSE client |
| E2E | Playwright | Point at Tauri dev URL; keep existing 13 specs |
| Manual | Checklist | Install fresh on Win/Mac/Linux |

**E2E migration:** Update `playwright.config.ts` base URL to Tauri dev server port.

---

## 11. Risk register

| Risk | Impact | Mitigation |
|------|--------|------------|
| tRPC streaming hard to replicate | High | Dedicated SSE endpoints; don't force rspc for streams |
| SQLite migration data loss | High | Import tool + export backup before migrate |
| WebView differences (Safari vs WebView2) | Medium | Test MUI + markdown on all 3 OS |
| Rust compile times slow CI | Medium | `sccache`, split crates, incremental builds |
| OpenRouter API changes | Medium | Abstract behind `llm/` trait |
| Scope creep (RAG, local LLM) | High | Strict Local Edition matrix; defer v2 |
| Contributor onboarding (Rust) | Medium | Good docs; keep React for UI contributors |

---

## 12. Success criteria (definition of done)

- [ ] Single click install on Windows, macOS, Linux
- [ ] No Node.js, pnpm, or terminal required for end users
- [ ] All chats, messages, workflows, settings stored locally in SQLite
- [ ] API keys never sent anywhere except LLM providers
- [ ] OpenRouter configured → chat streams correctly
- [ ] App cold start < 2 seconds on average hardware
- [ ] Installer < 60 MB
- [ ] RAM idle < 80 MB
- [ ] MIT (or Apache-2.0) licensed public repo
- [ ] E2E test suite green on CI

---

## 13. Timeline overview

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0 — Foundation | 2–3 weeks | 3 weeks |
| 1 — Tauri shell | 2–3 weeks | 6 weeks |
| 2 — SQLite data layer | 3–4 weeks | 10 weeks |
| 3 — Rust LLM streaming | 4–5 weeks | 15 weeks |
| 4 — API parity + client swap | 4–6 weeks | 21 weeks |
| 5 — Local Edition UX | 3–4 weeks | 25 weeks |
| 6 — Security + release | 3–4 weeks | **~28–30 weeks** |

> **~7 months** for one experienced Rust + React developer working full-time.  
> With 2 developers (Rust backend + React frontend in parallel): **~4–5 months**.

---

## 14. Immediate next steps (start this week)

1. **Initialize Tauri v2** in `src-tauri/` alongside existing app
2. **Create SQLite schema** (`migrations/001_initial.sql`)
3. **Spike Axum + SSE** — hardcode one OpenRouter stream endpoint to validate latency
4. **Write JSON importer** — prove `.data/dev-store.json` → SQLite
5. **Define Local Edition route map** — simplify frontend routes on paper
6. **Open GitHub issue milestones** — one per phase

---

## 15. Reference: Node → Rust module map

```
backend/src/store/devStore.ts      → src-tauri/src/db/repos/*.rs
backend/src/store/providerKeys.ts  → src-tauri/src/db/repos/provider_keys_repo.rs
backend/src/store/persistence.ts   → src-tauri/src/db/migrations/
backend/src/ai/streamCompletion.ts → src-tauri/src/llm/router.rs
backend/src/ai/providers/*.ts      → src-tauri/src/llm/{openai,anthropic,gemini,perplexity}.rs
backend/src/ai/modelProviders.ts   → src-tauri/src/llm/router.rs
backend/src/ai/llmMeta.ts          → src-tauri/src/llm/models.rs + models.json
backend/src/trpc.ts                → src-tauri/src/api/*.rs + src-tauri/src/server/routes.rs
backend/src/server.ts              → src-tauri/src/server/mod.rs
src/lib/api/trpc/                  → src/lib/api/client/ (rspc or fetch+SSE)
```

---

*Document version: 1.0 — 2026-06-06*  
*Maintainer: KathaGPT core team*
