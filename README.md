# KathaGPT Local Edition

**Fast, private AI chat on your machine — powered by Rust.** Bring your own API key; conversations, workflows, and settings stay on your device.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/santoshpremi/KathaGPT?style=social)](https://github.com/santoshpremi/KathaGPT)

| | |
|---|---|
| **Version** | 0.1.0 |
| **Stack** | React · **Rust (Axum)** · Tauri v2 · SQLite |
| **Platforms** | macOS · Windows · Linux |
| **Repo** | [github.com/santoshpremi/KathaGPT](https://github.com/santoshpremi/KathaGPT) |
| **Website** | [Marketing site](website/) · deploy via GitHub Pages |

---

## Powered by Rust

KathaGPT’s backend is **100% Rust** — the old Node.js server is gone. One native core handles everything that matters for speed and privacy:

| Benefit | How |
|---------|-----|
| **Low overhead** | Axum API embedded in the Tauri process — no separate Node runtime, no Electron Chromium bundle |
| **Fast streaming** | SSE token streams parsed in Rust (`reqwest` + Tokio) with minimal latency between provider and UI |
| **Efficient storage** | SQLite via `sqlx` — instant chat history, workflows, and settings on disk |
| **Memory safety** | Rust catches data races and use-after-free at compile time; fewer crashes around your local data |
| **Small desktop app** | Tauri uses the OS WebView → smaller installers and lower RAM than typical Electron AI clients |
| **Loopback-only API** | Server binds `127.0.0.1:17890` — not exposed to your LAN |

```
┌─────────────────────────────────────────────┐
│  KathaGPT.app / .exe / .AppImage             │
│  ┌───────────────────────────────────────┐  │
│  │  Tauri (Rust)                         │  │
│  │  • Native window + system tray        │  │
│  │  • Axum API · SQLite · LLM routing    │  │
│  │  • WebView → React UI (dist/)         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
          │ HTTPS (only when you chat)
          ▼
   OpenRouter / OpenAI / Anthropic / Gemini / Perplexity
```

---

## Why KathaGPT?

- **Local-first** — Chats and app data live in SQLite on your machine, not on a remote server.
- **BYOK** — Connect OpenRouter, OpenAI, Anthropic, Gemini, or Perplexity with keys you control.
- **Protected keys** — API keys stay local; masked in the UI. See [SECURITY.md](SECURITY.md) for storage details.
- **Native desktop** — One-click `.dmg` / `.msi` / `.AppImage` installers; also runs in the browser during development.
- **Open source** — MIT licensed; inspect, fork, and self-host the stack.

### What's included

| Area | Features |
|------|----------|
| **Chat** | Streaming responses, multi-model picker, artifacts, draft chats (no empty saves) |
| **Tools** | Research assistant (Sonar + citations), image generator, translator, meeting notes, tech support |
| **Productivity** | Workflows, prompt library (10 best practices + saved prompts), JSON export/import |
| **Data** | Legacy `.data/dev-store.json` auto-migration on first launch |

---

## Quick start

### Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | ≥ 20.12 (see `.nvmrc`) |
| [pnpm](https://pnpm.io/) | 9+ |
| [Rust](https://rustup.rs/) | stable (for API & desktop builds) |

For desktop builds, install [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS.

### 1. Install & run

```bash
git clone https://github.com/santoshpremi/KathaGPT.git
cd KathaGPT
pnpm install
./start-dev.sh          # or: pnpm dev
```

Open **http://localhost:5173** — the Rust API runs on **http://127.0.0.1:17890** (proxied as `/api/local`).

### 2. Add an API key

Copy the example env file and add at least one provider key:

```bash
cp .env.example .env
```

Or add keys in the app: **Settings → API Keys**. OpenRouter is recommended for the broadest model access.

### 3. Desktop app (optional)

```bash
pnpm tauri:dev          # dev with native window
pnpm tauri:build        # production installer (.dmg / .msi / .AppImage)
```

**macOS install (unsigned build):** Download from [the website](https://santoshpremi.github.io/KathaGPT/) or build locally. If macOS shows *“could not verify”*, the browser added a quarantine flag — this is expected without Apple notarization ($99/yr Developer ID).

1. **Terminal (recommended):** After downloading the `.dmg` to `~/Downloads`, run the one-liner on the [download page](https://santoshpremi.github.io/KathaGPT/#download), or:
   ```bash
   ./scripts/install-macos.sh
   ```
2. **Already in Applications?** `xattr -cr /Applications/KathaGPT.app && open -a KathaGPT`
3. **Manual:** Right-click **KathaGPT.app** → **Open** → **Open** again.

To ship notarized builds from CI, add GitHub secrets: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`.

---

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `./start-dev.sh` | Clears port conflicts & Vite cache, starts UI + Rust API |
| `pnpm dev` | Vite (`:5173`) + Rust API (`:17890`) |
| `pnpm local:api` | Rust API only |
| `pnpm build` | Production frontend build → `dist/` |
| `pnpm tauri:dev` | Tauri desktop + dev servers |
| `pnpm tauri:build` | Desktop installer bundles |
| `pnpm test:e2e` | Playwright end-to-end tests |
| `pnpm website:dev` | Marketing site on **:5174** (app uses :5173) |
| `pnpm website:build` | Build landing page → `website/dist` |

### Data locations

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/KathaGPT/kathagpt.db` |
| Windows | `%APPDATA%\KathaGPT\kathagpt.db` |
| Linux | `~/.local/share/KathaGPT/kathagpt.db` |

Health check: `GET http://127.0.0.1:17890/api/local/health`

### Project layout

```
KathaGPT/
├── src/                 # React UI (Vite + MUI)
├── src-tauri/           # Rust API, LLM routing, SQLite, Tauri shell
├── website/             # Marketing landing page (separate Vite app)
├── migrations/          # SQLite schema
├── test/e2e/            # Playwright tests
└── docs/                # Architecture & migration notes
```

---

## API reference

All routes are under `/api/local`. The Node.js backend has been removed — everything goes through Rust.

<details>
<summary><strong>Core</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health + SQLite status |
| `GET` | `/v1/status` | Local edition metadata |
| `GET` | `/user/me` | Local user profile |
| `PATCH` | `/user/me` | Update profile |
| `GET` | `/data/export` | JSON backup snapshot |
| `POST` | `/data/import` | Restore from backup |

</details>

<details>
<summary><strong>Provider keys</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/provider-keys/status` | Key status for all providers |
| `POST` | `/provider-keys/set` | Save API key (local SQLite) |
| `DELETE` | `/provider-keys/{provider}` | Remove stored key |
| `POST` | `/provider-keys/test` | Test provider connection |

</details>

<details>
<summary><strong>Chat & messages</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/chats` | List chats (with messages only) |
| `POST` | `/chats` | Create chat |
| `GET` | `/chats/{id}` | Get chat |
| `PATCH` | `/chats/{id}` | Update chat |
| `DELETE` | `/chats/{id}` | Delete chat |
| `GET` | `/chats/{id}/messages` | List messages |
| `POST` | `/chats/{id}/messages/stream` | Send message (SSE: `init`, `delta`, `done`) |

</details>

<details>
<summary><strong>Models, workflows, artifacts</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/model-config/enabled` | Built-in model list |
| `GET` | `/model-config/available` | Models for configured keys |
| `GET` | `/model-config/provider-models/{provider}` | Provider-specific models |
| `GET` | `/model-config/openrouter-models` | OpenRouter catalog |
| `GET` | `/workflows` | List workflows |
| `POST` | `/workflows` | Create workflow |
| `GET` | `/workflows/favorites` | Favorite workflows |
| `POST` | `/workflows/{id}/favorite` | Toggle favorite |
| `GET` | `/chats/{id}/artifact` | Chat artifact |
| `POST` | `/artifacts` | Create artifact |
| `POST` | `/artifacts/{id}/stream` | Stream artifact revision |

</details>

<details>
<summary><strong>Tools</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/research/query` | Research assistant (Sonar / citations) |
| `POST` | `/translate` | Text translation |
| `GET` | `/images/models` | Image generation models |
| `POST` | `/images/generate` | Generate image |
| `POST` | `/images/improve-prompt` | Improve image prompt |
| `POST` | `/files/extract-text` | Extract text from uploaded files |

</details>

Deeper architecture notes: [`docs/LOCAL_EDITION_MIGRATION_PLAN.md`](docs/LOCAL_EDITION_MIGRATION_PLAN.md)

---

## Testing

```bash
pnpm test:e2e           # headless
pnpm test:e2e:ui        # interactive UI
```

CI runs Rust checks (`.github/workflows/rust.yml`), Playwright (`.github/workflows/e2e.yml`), and release builds on version tags (`.github/workflows/release.yml`).

---

## Marketing website

The landing page lives in `website/` — Rust performance section, features, FAQ, and GitHub Releases download buttons.

**Live site (after Pages deploy):** `https://santoshpremi.github.io/KathaGPT/`

```bash
pnpm website:dev        # http://localhost:5174
pnpm website:build
pnpm website:preview
```

Set `VITE_GITHUB_REPO=owner/repo` in `website/.env` (see `website/.env.example`) so download links point at your releases.

**Deploy:** Push to `main`/`master` with `website/**` changes → GitHub Actions builds and deploys to Pages (`.github/workflows/website.yml`). Enable **Settings → Pages → Source: GitHub Actions** once.

### Release checklist

1. Run `pnpm test:e2e` on `main`.
2. Tag: `git tag v0.1.0 && git push origin v0.1.0` — CI builds macOS (ARM + Intel), Windows, and Linux installers.
3. Confirm [GitHub Releases](https://github.com/santoshpremi/KathaGPT/releases) has `.dmg` / `.msi` / `.AppImage` assets.
4. Verify the Pages site shows working download buttons.

---

## Open Work · Roadmap

High-value areas that would push KathaGPT ahead of competing AI desktop clients.

---

### 1 · Core Killer Feature — Full Local LLM Support

> **Biggest gap right now.** KathaGPT is currently BYOK cloud-only. Adding local model support would dominate the privacy-focused market where competitors like [Jan.ai](https://jan.ai), [LM Studio](https://lmstudio.ai), and [Open WebUI](https://openwebui.com) currently win.

#### What to build

| Task | Detail |
|------|--------|
| **Ollama integration** | Auto-detect a running Ollama instance (`http://localhost:11434`); enumerate available models via the Ollama REST API; stream responses through the existing SSE pipeline — no new UI paradigm needed |
| **llama.cpp via Rust** | For fully embedded inference: evaluate [`llama-rs`](https://github.com/rustformers/llama.cpp-rs), [`candle`](https://github.com/huggingface/candle) (HuggingFace), or a Tauri sidecar wrapping `llama-server` — sidecar is lowest risk to start |
| **Model manager** | UI to download, quantize (Q4/Q8), and delete local models; hardware detection (VRAM, Apple Neural Engine, CPU cores) to recommend sensible defaults |
| **Hybrid mode** | Seamlessly route individual messages to either local or cloud models within the same chat thread; useful for cost-sensitive workflows where cheap/fast tasks stay local while complex reasoning hits a cloud frontier model |
| **Hardware detection** | Read GPU info (Metal on macOS, CUDA/ROCm on Linux/Windows) and surface it in Settings → guide users to the best quant level for their machine |

#### Why this matters

- Users who care most about privacy cannot be served by cloud-only clients at all — this is a complete market segment currently unreachable.
- Offline capability turns KathaGPT into a tool that works on planes, air-gapped networks, and corporate environments that block outbound LLM traffic.
- Local model support is the single feature that most separates "chat wrapper" from "serious AI desktop app" in community perception.

---

### 2 · Technical & Performance Upgrades

#### Rust backend

| Improvement | Detail | Why it matters |
|-------------|--------|----------------|
| **Context window management** | Track token counts per model, auto-truncate oldest messages when the context limit approaches, expose remaining tokens in the UI | Prevents silent truncation errors and unexpected costs on long conversations |
| **Token counting** | Implement tiktoken-rs or call provider `/tokenize` endpoints; show live token usage per message and per chat | Power users need this for budget control |
| **Smart truncation strategies** | Sliding window, summary compression, or pinned-system-prompt modes | Improves response quality on long threads |
| **Structured error surface** | Map provider error codes (rate limit, context exceeded, invalid key) to user-friendly messages in the UI instead of raw JSON | Reduces support burden |

#### Tauri / native shell

| Improvement | Detail | Why it matters |
|-------------|--------|----------------|
| **System tray enhancements** | Quick-compose window from tray, show/hide with a single click, unread indicator | Native app feel; comparable to Raycast / Alfred integrations |
| **Global hotkeys** | Register a system-wide shortcut (e.g. `⌘⇧Space`) to summon the chat window from any app | One of the most-requested features in competing tools |
| **Auto-updater** | Tauri's built-in `tauri-plugin-updater` + GitHub Releases JSON feed | Eliminates manual re-download on every release |
| **Windows / Linux parity** | Test installer flows on Windows (`.msi`) and Linux (`.AppImage`) equivalents of the macOS setup scripts | Needed before any broad release |

#### UI / UX polish

| Improvement | Detail | Why it matters |
|-------------|--------|----------------|
| **Dark / light auto-theme** | Follow `prefers-color-scheme`; persist user override in SQLite settings | Expected baseline for any desktop app in 2025 |
| **Markdown + LaTeX rendering** | Render `$$...$$` and `$...$` inline math (KaTeX or MathJax); already using markdown, this is a one-package add | Essential for research, academic, and STEM users |
| **Code highlighting + copy** | Syntax highlight code fences (`highlight.js` / `shiki`); one-click copy button per block | High-frequency action in every developer workflow |
| **Better sidebar** | Collapsible, mobile-like navigation drawer; section headers for Today / This Week / Older in chat history | Reduces visual noise; scales to hundreds of chats |

#### Memory & RAG

| Improvement | Detail | Why it matters |
|-------------|--------|----------------|
| **Built-in vector search** | Add [`sqlite-vec`](https://github.com/asg017/sqlite-vec) extension (pure SQLite, no extra service) for semantic search over chat history and uploaded documents | Huge differentiator for power users — no Pinecone/Chroma dependency |
| **Long-term memory** | Summarise older conversations and store embeddings; surface relevant context automatically when starting a new chat on the same topic | Replaces the manual "start with context" workflow |
| **Document chat (RAG)** | Upload PDF / text → chunk → embed → retrieve at query time; already have a file extraction endpoint (`/files/extract-text`) to build on | Closes the gap with tools like Notion AI and ChatPDF |

#### Agents & workflows

| Improvement | Detail | Why it matters |
|-------------|--------|----------------|
| **Tool calling** | Expose model tool-call results (web search, code execution, file read/write) through the existing workflow engine | Required for any agentic loop |
| **Multi-step ReAct loops** | Let the Rust backend iterate model → tool → model until a stopping condition; surface intermediate steps in the UI | Turns KathaGPT into a local Cursor/Devin competitor for simple tasks |
| **Workflow marketplace** | Allow exporting and importing community workflows as JSON; host a small curated gallery on the website | Viral growth mechanism — users share useful automations |

---

## Contributing

Issues and pull requests are welcome. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
