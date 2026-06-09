# Contributing to KathaGPT

Thank you for your interest in contributing! KathaGPT is an open-source, private AI desktop app built with Rust, Tauri v2, React, and llama.cpp. All skill levels are welcome.

---

## Table of Contents

- [Quick Start for Contributors](#quick-start-for-contributors)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Good First Issues](#good-first-issues)
- [How to Submit a PR](#how-to-submit-a-pr)
- [Code Style](#code-style)
- [Running Tests](#running-tests)
- [Commit Conventions](#commit-conventions)

---

## Quick Start for Contributors

```bash
git clone https://github.com/santoshpremi/KathaGPT.git
cd KathaGPT
pnpm install
./start-dev.sh     # starts UI (port 5173) + Rust API (port 17890)
```

Open **http://localhost:5173** in your browser. That's it — no API key needed to get the UI running.

---

## Project Structure

```
KathaGPT/
├── src/                     # React frontend (Vite + TypeScript)
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-level page components
│   └── hooks/               # React hooks
├── src-tauri/               # Rust backend (Axum + Tauri v2)
│   └── src/
│       ├── api/             # HTTP route handlers
│       ├── llm/             # LLM routing, local model sidecar, streaming
│       │   ├── sidecar.rs   # llama-server lifecycle manager
│       │   ├── model_catalog.rs  # 18 curated model definitions
│       │   └── model_dl.rs  # async download + SSE progress
│       ├── db/              # SQLite schema + queries via sqlx
│       ├── models/          # Shared data types
│       └── server/          # Axum server setup
├── website/                 # Marketing landing page (separate Vite app)
├── migrations/              # SQLite schema migrations
├── test/e2e/                # Playwright end-to-end tests
├── docs/                    # Architecture notes
└── .github/
    ├── workflows/           # CI: build, test, release, website deploy
    └── ISSUE_TEMPLATE/      # Bug report + feature request templates
```

**Where things live at runtime:**

| OS      | Database & models |
|---------|-------------------|
| macOS   | `~/Library/Application Support/KathaGPT/` |
| Windows | `%APPDATA%\KathaGPT\` |
| Linux   | `~/.local/share/KathaGPT/` |

---

## Development Setup

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20.12 | [nodejs.org](https://nodejs.org/) |
| pnpm | 9+ | `npm i -g pnpm` |
| Rust (stable) | ≥ 1.77 | [rustup.rs](https://rustup.rs/) |
| Tauri CLI v2 | latest | `cargo install tauri-cli --version "^2"` |

**macOS only:** Xcode Command Line Tools — `xcode-select --install`

**Linux only:**
```bash
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

**Windows only:** Install the [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/).

### Running the dev server

```bash
pnpm install          # install frontend dependencies
./start-dev.sh        # clears port conflicts + starts everything
```

This starts:
- Vite dev server at `http://localhost:5173` (React UI with HMR)
- Rust Axum API at `http://127.0.0.1:17890` (proxied via `/api/local`)

### Running the desktop app in dev mode

```bash
pnpm tauri:dev
```

This opens a native desktop window. You need all prerequisites installed.

### Health check

```bash
curl http://127.0.0.1:17890/api/local/health
```

### Working on the marketing website only

```bash
pnpm website:dev      # http://localhost:5174
```

---

## Good First Issues

Look for issues tagged [`good first issue`](https://github.com/santoshpremi/KathaGPT/issues?q=is%3Aopen+label%3A%22good+first+issue%22) — these are scoped, well-defined tasks that don't require deep knowledge of the whole codebase.

Here are some areas where help is always welcome:

| Area | Examples |
|------|---------|
| **Frontend (React/TypeScript)** | UI polish, keyboard shortcuts, accessibility improvements |
| **Rust backend** | New API endpoints, improving error messages, adding model metadata |
| **Documentation** | Improving setup guides, adding examples, translating README |
| **Testing** | Adding Playwright tests for new flows |
| **Website** | Landing page copy, FAQ additions, visual improvements |

If you want to work on something not listed, open an issue first so we can discuss the approach before you invest time in it.

---

## How to Submit a PR

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Keep commits small and focused.

3. **Run the test suite** before opening a PR:
   ```bash
   pnpm test:e2e       # end-to-end tests (requires the dev server running)
   cargo test          # Rust unit tests (run inside src-tauri/)
   ```

4. **Check for lint errors:**
   ```bash
   pnpm lint           # ESLint on the frontend
   cargo clippy        # Rust lints (inside src-tauri/)
   ```

5. **Open a pull request** against `main`. Fill in the PR template — describe what changed and why.

6. A maintainer will review within a few days. Please respond to review comments promptly.

### PR checklist

- [ ] Changes are scoped to one concern (one feature or one bug fix per PR)
- [ ] Tests pass locally
- [ ] No new linter warnings introduced
- [ ] If adding a UI feature: tested on at least one platform
- [ ] If changing Rust API: updated the API reference section in README if relevant

---

## Code Style

### TypeScript / React

- We use **ESLint** — run `pnpm lint` before committing.
- Prefer functional components with hooks.
- Use TypeScript types, avoid `any`.
- Component files live in `src/components/`, page files in `src/pages/`.

### Rust

- We use **rustfmt** — run `cargo fmt` before committing.
- We use **clippy** — run `cargo clippy` and resolve warnings.
- Follow standard Rust naming conventions (snake_case for functions/variables, PascalCase for types).
- Add `///` doc comments to public functions.

---

## Running Tests

```bash
# Frontend end-to-end tests (Playwright)
pnpm test:e2e           # headless
pnpm test:e2e:ui        # interactive UI (shows browser)

# Rust unit tests
cd src-tauri
cargo test
```

CI automatically runs all tests on every pull request.

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add PDF export for chat history
fix: prevent crash when local model download fails mid-way
docs: improve local model setup instructions
refactor: simplify sidecar port detection logic
test: add e2e test for model picker
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `perf`

Scope is optional but helpful: `feat(ui)`, `fix(rust)`, `docs(readme)`

---

## Questions?

- Open a [GitHub Discussion](https://github.com/santoshpremi/KathaGPT/discussions) for questions, ideas, or feedback.
- Open an [Issue](https://github.com/santoshpremi/KathaGPT/issues) for bugs or feature requests.

We appreciate every contribution, no matter how small. Thank you for helping make KathaGPT better!
