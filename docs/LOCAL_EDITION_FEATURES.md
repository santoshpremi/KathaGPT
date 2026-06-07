# KathGPT Local Edition — Feature Matrix

**Edition:** Local (single-user, API-key-only)  
**Data:** 100% on-device SQLite (`~/Library/Application Support/KathGPT/kathgpt.db`)

## Ships in v1

| Feature | Backend | UI |
|---------|---------|-----|
| Chat (create, send, stream, delete) | Rust + SQLite | ✅ |
| Chat rename & model override | Rust + SQLite | ✅ |
| Message edit / regenerate | Rust (delete following) | ✅ |
| Provider API keys (5 providers) | Rust + SQLite | ✅ |
| Model selector | Rust | ✅ |
| Workflows (CRUD, favorites, demo) | Rust + SQLite | ✅ |
| Artifacts (basic CRUD) | Rust + SQLite | ✅ |
| First-run onboarding (API key wizard) | Rust | ✅ |
| Settings (keys, export/import) | Rust | ✅ |
| i18n (en + fallbacks) | — | ✅ |
| Desktop app (Tauri) | Rust shell | ✅ |
| System tray (Open / Quit) | Tauri | ✅ |

## Cut from Local Edition

| Feature | Reason |
|---------|--------|
| Multi-org / tenant switching | Single local user |
| Trial / phase / credits / upgrade | No billing |
| Academy / e-learning / gamification | Enterprise only |
| Analytics / Tally / Plausible | Privacy-first |
| RAG data pools | Deferred to v2 |
| Developer API tokens | Deferred |
| Auth / login page | No accounts |

## Route map

| Local Edition | Legacy (compat redirect) |
|---------------|--------------------------|
| `/` | → last chat or onboarding |
| `/chats/:chatId` | `/:orgId/chats/:chatId` |
| `/workflows` | `/:orgId/workflows` |
| `/settings` | modal + settings page |
| `/onboarding` | `/:orgId/onboarding` |
