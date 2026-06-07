# Security Policy

KathaGPT Local Edition is a **local-first** desktop app. Your chats, workflows, and settings are stored on your machine. The app talks to external LLM providers only when you send a message or use a tool that requires it.

This document describes what data leaves your device, how secrets are handled, and how to report security issues.

---

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Active |

Security fixes are published for the latest **0.1.x** release. Upgrade via [GitHub Releases](https://github.com/santoshpremi/KathaGPT/releases).

---

## What leaves your device

| Traffic | When | Destination |
|---------|------|-------------|
| **LLM API requests** | Chat, workflows, image generation, translation, research | Providers you configure (OpenRouter, OpenAI, Anthropic, Gemini, Perplexity) over **HTTPS** |
| **Model catalog** | Optional OpenRouter model list fetch | `openrouter.ai` |
| **Nothing else by default** | — | No cloud sync, no KathaGPT-hosted backend |

### Not sent by default

- Chat history to KathaGPT servers (there are none)
- Telemetry / error reporting (Sentry removed in local edition)
- Product analytics (Plausible component exists but is **not mounted** in the local app)

The **marketing website** (`website/`) is a separate static site. It may fetch GitHub Releases metadata for download buttons; it does not receive app data.

---

## Data stored locally

| Asset | Location | Notes |
|-------|----------|-------|
| SQLite database | OS app-data directory | Chats, messages, workflows, settings |
| API keys (UI-saved) | `provider_keys` table in SQLite | See [API key storage](#api-key-storage) |
| Master encryption key | OS keychain (`com.kathagpt.local`) or `.master-key` file fallback | Used when keys are stored with `enc:` prefix |
| Dev `.env` keys | Project `.env` (gitignored) | Optional fallback for local development |
| Tool session history | App-data JSON files | Per-tool history (research, translator, etc.) |

### Data paths

| OS | App data directory |
|----|--------------------|
| macOS | `~/Library/Application Support/KathaGPT/` |
| Windows | `%APPDATA%\KathaGPT\` |
| Linux | `~/.local/share/KathaGPT/` |

Back up or wipe data with **Settings → Export / Import** (`/api/local/data/export` and `/data/import`).

---

## API key storage

KathaGPT supports five providers: **OpenRouter**, **OpenAI**, **Anthropic**, **Gemini**, and **Perplexity**.

Keys can come from two places:

1. **In-app Settings → API Keys** — saved to the local SQLite database.
2. **Environment variables** — read from `.env` at API startup (`OPENROUTER_API_KEY`, `OPENAI_API_KEY`, etc.). Useful for development; never commit `.env`.

### Encryption (v0.1 behavior)

The codebase includes **AES-256-GCM** encryption (`src-tauri/src/crypto.rs`) with a 32-byte master key in the **OS keychain** (file fallback at `{app-data}/.master-key` for headless/CI).

| Storage format | Status |
|----------------|--------|
| `enc:…` prefixed keys | Decrypted at runtime (legacy / migration path) |
| Plaintext in SQLite | **Current default** when saving keys via the UI (v0.1 stability choice) |

**Implication:** Protect your machine and database file like any local secret store. Full at-rest encryption for UI-saved keys is planned; treat disk access on an unlocked machine as in scope for local threats.

Keys are **never** returned in full via the API — only masked values (e.g. `sk-or-v1••••••••abcd`).

---

## Local attack surface

| Component | Exposure | Mitigation |
|-----------|----------|------------|
| Rust API (Axum) | `127.0.0.1:17890` only | Not bound to `0.0.0.0`; not reachable from other machines on the LAN |
| CORS | Permissive on local API | Low risk while bound to loopback; do not reverse-proxy to the public internet without auth |
| Tauri WebView | Desktop shell | CSP restricts connect targets — see `src-tauri/tauri.conf.json` |
| Vite dev server | `localhost:5173` (dev only) | Development only; production desktop serves built `dist/` via Tauri |

### Content Security Policy (desktop)

The Tauri CSP allows connections to:

- `self`, `localhost`, `127.0.0.1`
- `openrouter.ai`, `api.openai.com`, `api.anthropic.com`, `generativelanguage.googleapis.com`, `api.perplexity.ai`

No arbitrary third-party scripts are loaded in the packaged app.

---

## Threat model (summary)

**In scope**

- Local user with filesystem access reading `kathagpt.db` or `.env`
- Malware on the same machine accessing loopback API or app-data
- Misconfigured port forwarding exposing `127.0.0.1:17890` (user responsibility)
- Prompt injection / untrusted document content in chat (user + provider responsibility)

**Out of scope (by design)**

- KathaGPT-operated cloud breach (no KathaGPT cloud backend)
- Cross-user isolation (single-user local app)
- Provider-side data handling (governed by each LLM provider’s policies)

---

## Security best practices for users

1. **Use official builds** from [GitHub Releases](https://github.com/santoshpremi/KathaGPT/releases) or build from source yourself.
2. **Do not commit** `.env` or share your `kathagpt.db` backup publicly.
3. **Rotate API keys** if you suspect exposure; remove keys via Settings → API Keys.
4. **Review provider policies** — message content is sent to the LLM provider you select.
5. **Keep the app updated** to the latest 0.1.x patch release.

---

## Reporting a vulnerability

**Please do not open public GitHub issues for undisclosed security bugs.**

### Preferred: GitHub private security advisory

1. Go to [github.com/santoshpremi/KathaGPT/security/advisories](https://github.com/santoshpremi/KathaGPT/security/advisories)
2. Click **Report a vulnerability**
3. Include steps to reproduce, impact, and affected version

### What to include

- Description and impact
- Steps to reproduce (PoC if possible)
- Affected version / commit
- Suggested fix (optional)

We aim to acknowledge reports within **7 days** and provide a fix or mitigation plan for confirmed issues affecting supported versions.

---

## Disclosure policy

- Valid reports are fixed in a patch release when practical.
- Reporters are credited in release notes unless they prefer anonymity.
- Please allow reasonable time for a fix before public disclosure (typically 90 days, coordinated case-by-case).

---

## Related documentation

- [README.md](README.md) — setup, API overview, release process
- [docs/LOCAL_EDITION_MIGRATION_PLAN.md](docs/LOCAL_EDITION_MIGRATION_PLAN.md) — architecture and data flow
