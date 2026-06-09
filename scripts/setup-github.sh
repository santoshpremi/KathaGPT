#!/usr/bin/env bash
# setup-github.sh — Run this once after pushing to GitHub to:
#   1. Import all labels from .github/labels.yml
#   2. Set repository topics
#   3. Seed 6 "good first issue" issues
#
# Requirements: gh CLI installed and authenticated (gh auth login)
# Usage: bash scripts/setup-github.sh

set -e

REPO="santoshpremi/KathaGPT"

echo "==> Checking gh CLI..."
if ! command -v gh &>/dev/null; then
  echo "ERROR: gh CLI not found. Install from https://cli.github.com/"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "ERROR: Not logged in. Run: gh auth login"
  exit 1
fi

echo ""
echo "==> [1/3] Importing labels from .github/labels.yml..."
# Parse labels.yml manually and create/edit each label
# (gh label import only exists in newer versions; this is compatible with v2.x)
python3 - <<'PYEOF'
import subprocess, re, sys

with open(".github/labels.yml") as f:
    content = f.read()

# Parse simple YAML blocks
entries = []
current = {}
for line in content.splitlines():
    line = line.rstrip()
    if line.startswith("- name:"):
        if current:
            entries.append(current)
        current = {"name": line.split(":", 1)[1].strip().strip('"')}
    elif line.startswith("  color:"):
        current["color"] = line.split(":", 1)[1].strip().strip('"')
    elif line.startswith("  description:"):
        current["description"] = line.split(":", 1)[1].strip().strip('"')
if current:
    entries.append(current)

repo = "santoshpremi/KathaGPT"
for e in entries:
    name = e.get("name", "")
    color = e.get("color", "ededed")
    desc = e.get("description", "")
    # Try edit first, create if it fails
    r = subprocess.run(
        ["gh", "label", "edit", name, "--repo", repo,
         "--color", color, "--description", desc],
        capture_output=True
    )
    if r.returncode != 0:
        r2 = subprocess.run(
            ["gh", "label", "create", name, "--repo", repo,
             "--color", color, "--description", desc],
            capture_output=True
        )
        status = "created" if r2.returncode == 0 else f"FAILED: {r2.stderr.decode().strip()}"
    else:
        status = "updated"
    print(f"  {name}: {status}")
PYEOF
echo "    Labels done."

echo ""
echo "==> [2/3] Setting repository topics..."
gh repo edit "$REPO" \
  --add-topic rust \
  --add-topic tauri \
  --add-topic local-llm \
  --add-topic llama-cpp \
  --add-topic privacy \
  --add-topic ai-chat \
  --add-topic desktop-app \
  --add-topic open-source \
  --add-topic llm \
  --add-topic react \
  --add-topic sqlite \
  --add-topic axum
echo "    Topics set."

echo ""
echo "==> [3/3] Creating 'good first issue' seed issues..."

gh issue create \
  --repo "$REPO" \
  --title "Add keyboard shortcut reference page in the Settings UI" \
  --label "good first issue,help wanted,frontend" \
  --body "## Description
Add a keyboard shortcuts reference panel (or modal) in the Settings screen that lists all available keyboard shortcuts in the app.

## Why this is a good first issue
- Self-contained UI addition — no Rust changes needed
- Can reuse existing modal/dialog components from the codebase
- Easy to test visually

## Files / areas to look at
- \`src/pages/\` — Settings page
- \`src/components/\` — existing modal/dialog patterns to reuse

## Acceptance criteria
- [ ] A new panel or tab in Settings titled 'Keyboard Shortcuts'
- [ ] Lists at least the most common shortcuts (new chat, open settings, focus search, etc.)
- [ ] Works on macOS (⌘) and Windows/Linux (Ctrl) — detect platform and show correct key

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md) — dev setup instructions"

echo "    Issue 1 created."

gh issue create \
  --repo "$REPO" \
  --title "Show a 'Copy code' button on code blocks in chat responses" \
  --label "good first issue,help wanted,frontend" \
  --body "## Description
When the AI returns a code block in a chat message, add a small 'Copy' button (clipboard icon) in the top-right corner of the block. Clicking it copies the code to clipboard and shows brief 'Copied!' feedback.

## Why this is a good first issue
- Isolated to the chat message rendering component
- No Rust/backend changes required
- A very common UX pattern with many examples to reference

## Files / areas to look at
- \`src/components/\` — look for the component that renders chat message content / markdown

## Acceptance criteria
- [ ] Copy button visible on hover over any code block
- [ ] Clicking copies the raw code text to clipboard
- [ ] Brief visual feedback after copy (e.g. icon changes to checkmark for 1.5s)

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 2 created."

gh issue create \
  --repo "$REPO" \
  --title "Improve error message when local model download fails mid-way" \
  --label "good first issue,help wanted,rust,local-llm" \
  --body "## Description
When a local model download fails (e.g. network drop, disk full, server error), the error shown to the user is a raw technical message. Improve it to show a friendly, actionable message with a 'Retry' option.

## Why this is a good first issue
- Well-scoped: the download logic is isolated in one file
- Teaches the SSE progress stream and error handling pattern in this codebase

## Files / areas to look at
- \`src-tauri/src/llm/model_dl.rs\` — async download + SSE progress events
- \`src/\` — the frontend component that displays download progress

## Acceptance criteria
- [ ] Network failure shows: 'Download failed — check your connection and try again'
- [ ] Disk-full error shows: 'Not enough disk space to download this model'
- [ ] A 'Retry' button re-triggers the download without needing to navigate away
- [ ] Partial download is cleaned up on failure

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 3 created."

gh issue create \
  --repo "$REPO" \
  --title "Add a --version flag to the CLI / standalone API server" \
  --label "good first issue,help wanted,rust" \
  --body "## Description
Add a \`--version\` flag to the standalone API server binary (the \`api-server\` example) so users can run \`kathagpt-api --version\` and see the current version.

## Why this is a good first issue
- Very small Rust change — one function, a few lines
- Great introduction to the Cargo.toml / Tauri versioning setup

## Files / areas to look at
- \`src-tauri/examples/api-server.rs\` — entry point for the standalone server
- \`src-tauri/Cargo.toml\` — where the version is defined

## Acceptance criteria
- [ ] \`cargo run --example api-server --features api-server-cli -- --version\` prints the current version
- [ ] Matches the version in \`Cargo.toml\`

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 4 created."

gh issue create \
  --repo "$REPO" \
  --title "Add a chat export button (Markdown / plain text)" \
  --label "good first issue,help wanted,frontend" \
  --body "## Description
Add an 'Export chat' option in the chat menu (three-dot menu or similar) that lets users download the current conversation as a Markdown or plain text file.

## Why this is a good first issue
- Frontend-only — no Rust changes needed (the JSON export API already exists if needed)
- Useful feature with clear scope

## Files / areas to look at
- \`src/\` — chat view and message list components
- Existing export: \`GET /api/local/data/export\` (full backup) — for reference on data shape

## Acceptance criteria
- [ ] 'Export as Markdown' option in the chat action menu
- [ ] Downloaded file is named \`chat-YYYY-MM-DD.md\` with a header and all messages
- [ ] User and assistant messages are clearly distinguished in the output

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 5 created."

gh issue create \
  --repo "$REPO" \
  --title "Translate README to one additional language (e.g. German, Spanish, or Chinese)" \
  --label "good first issue,help wanted,documentation" \
  --body "## Description
Translate the README into one other language to make KathaGPT more accessible. A translated README as \`README.de.md\`, \`README.es.md\`, or \`README.zh.md\` with a language switcher note at the top of the main README would be great.

## Why this is a good first issue
- No code changes required — pure documentation
- Perfect for native speakers of any language
- High impact: GitHub surfaces projects with translated docs to non-English audiences

## Acceptance criteria
- [ ] New file at root: \`README.xx.md\` (where xx is the ISO language code)
- [ ] Covers at least: intro, Why KathaGPT, Quick Start, and Contributing sections
- [ ] Main \`README.md\` links to translated versions at the top (e.g. '🇩🇪 Deutsch | 🇪🇸 Español')

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 6 created."

echo "    Issue 6 created."

# ---------------------------------------------------------------------------
# Round 2: Codebase-grounded issues
# ---------------------------------------------------------------------------

gh issue create \
  --repo "$REPO" \
  --title "Show token counter and remaining context indicator in chat input" \
  --label "enhancement,help wanted,frontend,ux,roadmap" \
  --body "## Description
Add a token counter below the chat input showing how many tokens are in the current conversation and how many remain before hitting the model's context limit.

This is listed in the roadmap: *'Token counter, smart truncation, remaining-tokens indicator'*.

## Why this matters
Users of local models (context capped at 8K–32K) have no way to know when they're approaching the limit. The only signal is a silent truncation.

## Current state
- Context size is set in \`src-tauri/src/llm/sidecar.rs\` (8192 for 1B/3B models, 16384 for mid-range, 32768 for large)
- The \`StreamOptions\` struct in \`src-tauri/src/llm/stream.rs\` includes \`max_tokens\` but usage data is not returned to the frontend
- \`src/components/chat/input/ChatInput.tsx\` — this is where the counter UI should appear

## Suggested approach
1. Count tokens client-side using a lightweight tokenizer (e.g. \`@dqbd/tiktoken\`) as a fast approximation
2. Display as a small badge near the send button: e.g. \`1,240 / 8,192 tokens\`
3. Warn when > 80% full

## Acceptance criteria
- [ ] Token count visible in the chat input area
- [ ] Updates in real time as user types or conversation grows
- [ ] Shows model context limit for the active model
- [ ] Works for both local and cloud models

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 7 created."

gh issue create \
  --repo "$REPO" \
  --title "Auto-detect RAM and recommend appropriate local models" \
  --label "enhancement,help wanted,rust,local-llm,ux,roadmap" \
  --body "## Description
When a user opens the model catalog, KathaGPT should detect available system RAM (and VRAM for CUDA systems) and automatically highlight which models will fit, hiding or graying out ones that are too large.

This is listed in the roadmap: *'Hardware detection (VRAM/RAM), auto-recommend quant level'*.

## Current state
- \`src-tauri/src/llm/sidecar.rs\` — context size is set by crude model-name string matching (e.g. contains \`\"1b\"\`), no actual RAM check
- \`src-tauri/src/llm/model_catalog.rs\` — each \`CatalogEntry\` already has a \`min_ram_gb: u8\` field  
- \`src/pages/(modals)/+localModels.tsx\` — catalog UI where the filter/badge should appear

## Suggested approach
### Rust side
Add a new \`GET /api/local/system/info\` endpoint returning:
\`\`\`json
{ \"ram_gb\": 16, \"vram_gb\": 8, \"platform\": \"macos-arm\" }
\`\`\`
Use the \`sysinfo\` crate (already common in Tauri apps) to read available memory.

### Frontend side
In \`+localModels.tsx\`, fetch system info on mount and:
- Mark models within RAM budget as **Recommended**
- Dim models that exceed available RAM with a tooltip: *'Requires 16 GB RAM — you have 8 GB'*

## Acceptance criteria
- [ ] New \`/api/local/system/info\` endpoint returns RAM (and VRAM when available)
- [ ] Model catalog shows a 'Recommended' badge on models that fit
- [ ] Models outside RAM budget are visually de-emphasized with a reason tooltip
- [ ] Works on macOS (Metal), Linux (CUDA + CPU), Windows

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 8 created."

gh issue create \
  --repo "$REPO" \
  --title "Add chat search — filter sidebar by message content or title" \
  --label "enhancement,help wanted,frontend,rust,ux" \
  --body "## Description
Add a search box in the sidebar that lets users find past chats by title or message content.

## Current state (confirmed gap)
- \`src/components/sidebar/Sidebar.tsx\` — no search input exists
- \`src-tauri/src/api/chats.rs\` — \`GET /chats\` only lists all chats, no search/filter parameter
- \`src-tauri/src/db/repos/chats.rs\` — no full-text search query

## Suggested approach
### Rust side
Extend \`GET /api/local/chats?q=search+term\` to filter by chat name and message content using SQLite \`LIKE\` (fast enough for local use) or \`FTS5\` (better for large histories).

### Frontend side
Add a search input at the top of \`src/components/sidebar/Sidebar.tsx\`:
- Debounce input by 300ms
- Hit the API and replace the chat list with results
- Highlight matching terms in chat titles

## Acceptance criteria
- [ ] Search box in sidebar, triggered by typing or \`⌘K\` / \`Ctrl+K\`
- [ ] Searches chat names and message content
- [ ] Results update within 300ms of typing
- [ ] Empty state: 'No chats matching \"..\"'

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 9 created."

gh issue create \
  --repo "$REPO" \
  --title "Add local-model-first path to onboarding — skip API key step" \
  --label "enhancement,help wanted,frontend,ux,good first issue" \
  --body "## Description
The current onboarding flow (\`src/pages/onboarding.tsx\`) has three steps: Welcome → API Key → Done. The API Key step only accepts an OpenRouter key — there is no path for users who want to use KathaGPT offline with a local model.

Many users land here from r/LocalLLaMA or r/selfhosted specifically because they **don't** want cloud keys. They get stuck on step 2.

## Current state
- \`src/pages/onboarding.tsx\` — Step 2 says 'API Key' with a single OpenRouter input
- A 'Skip' button exists but just advances past the step without explanation

## Suggested approach
Offer two paths on step 2:

**Path A — Cloud (API key):** Current behavior, add OpenRouter key.  
**Path B — Local (offline):** Show a button 'Download a local model instead →' that opens the local model catalog modal (\`+localModels.tsx\`) inline.

This could be two cards side by side with a divider and 'or'.

## Acceptance criteria
- [ ] Onboarding step 2 offers both cloud and local paths clearly
- [ ] 'Try local model' option opens the model catalog
- [ ] Skip label updated to 'Set up later' with a note that you can add keys in Settings anytime

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 10 created."

gh issue create \
  --repo "$REPO" \
  --title "Global hotkey (⌘⇧Space) to open quick-compose window" \
  --label "enhancement,help wanted,rust,ux,roadmap" \
  --body "## Description
Add a system-wide global hotkey (⌘⇧Space on macOS, Ctrl+Shift+Space on Windows/Linux) that opens a compact quick-compose window even when KathaGPT is in the background.

This is in the roadmap: *'Global hotkey (⌘⇧Space), auto-updater, system tray quick-compose'*.

## Current state
- \`src-tauri/Cargo.toml\` — \`tauri-plugin-global-shortcut\` is not yet listed as a dependency
- \`src-tauri/src/main.rs\` — no shortcut registration

## Suggested approach
1. Add \`tauri-plugin-global-shortcut = \"2\"\` to \`Cargo.toml\`
2. Register the shortcut in \`src-tauri/src/main.rs\` on app startup
3. On trigger: if the app is minimized/hidden → show main window; or open a dedicated small overlay window
4. Persist the configured hotkey in SQLite settings table so users can change it

## Acceptance criteria
- [ ] ⌘⇧Space (macOS) / Ctrl+Shift+Space (Win/Linux) brings KathaGPT to foreground
- [ ] Hotkey is configurable in Settings
- [ ] Works when the app is running in the system tray (minimized)
- [ ] Correctly registers/unregisters on app quit

## Resources
- [tauri-plugin-global-shortcut docs](https://v2.tauri.app/plugin/global-shortcut/)
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 11 created."

gh issue create \
  --repo "$REPO" \
  --title "Add auto-updater — notify and apply updates in-app" \
  --label "enhancement,help wanted,rust,ci-cd,roadmap" \
  --body "## Description
Add an in-app auto-updater so users are notified of new releases and can update without re-downloading the installer.

This is in the roadmap: *'auto-updater'*.

## Current state
- \`src-tauri/Cargo.toml\` — \`tauri-plugin-updater\` is not listed as a dependency
- \`.github/workflows/release.yml\` — builds installers but no updater manifest is generated

## Suggested approach
1. Add \`tauri-plugin-updater = \"2\"\` to \`Cargo.toml\`
2. Configure \`tauri.conf.json\` \`updater\` section pointing to a GitHub Releases endpoint
3. On app start (and periodically), check for updates in background
4. Show a non-intrusive notification badge in the sidebar or system tray: *'Update available — v0.1.2'*
5. Update the release CI workflow (\`.github/workflows/release.yml\`) to generate and sign the updater manifest

## Acceptance criteria
- [ ] App checks for updates on startup (background, no blocking)
- [ ] User sees a notification when a new version is available
- [ ] One-click install and relaunch
- [ ] Works on macOS, Windows, Linux

## Resources
- [Tauri v2 updater plugin docs](https://v2.tauri.app/plugin/updater/)
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 12 created."

gh issue create \
  --repo "$REPO" \
  --title "Add FTS5 full-text search index on messages table" \
  --label "enhancement,help wanted,rust,database,performance" \
  --body "## Description
Add a SQLite FTS5 (Full Text Search) virtual table on the \`messages\` content column so chat search is fast even with thousands of messages.

## Current state
- \`migrations/001_initial.sql\` — \`messages\` table has an index on \`(chat_id, created_at)\` but no full-text index
- \`migrations/002_documents.sql\` — \`documents\` table has no index at all on \`created_at\` or \`uploaded_by_id\`
- Any chat search would require a slow \`LIKE '%term%'\` scan

## Suggested approach
Add a new migration \`migrations/003_fts.sql\`:
\`\`\`sql
-- FTS5 virtual table for fast message search
CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts
USING fts5(content, content='messages', content_rowid='rowid');

-- Keep FTS in sync via triggers
CREATE TRIGGER messages_ai AFTER INSERT ON messages BEGIN
  INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;
CREATE TRIGGER messages_ad AFTER DELETE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES('delete', old.rowid, old.content);
END;
CREATE TRIGGER messages_au AFTER UPDATE ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content) VALUES('delete', old.rowid, old.content);
  INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
END;

-- Also add missing index on documents table
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
\`\`\`

## Acceptance criteria
- [ ] New migration file applies cleanly via \`sqlx migrate run\`
- [ ] \`SELECT\` from \`messages_fts\` returns results for a term present in any message
- [ ] \`EXPLAIN QUERY PLAN\` on the search query shows FTS index usage, not a full scan
- [ ] Existing tests still pass

## Resources
- [SQLite FTS5 docs](https://www.sqlite.org/fts5.html)
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 13 created."

gh issue create \
  --repo "$REPO" \
  --title "Fix incomplete model capability metadata in llmMeta.ts" \
  --label "bug,help wanted,frontend,good first issue" \
  --body "## Description
\`src/shared/ai/llmMeta.ts\` contains \`// TODO: double check\` comments for model capabilities and token limits that may be incorrect.

## Current state
Line 137:
\`\`\`ts
capabilities: [\"Research\", \"Search\", \"Summarization\"], // TODO: double check
\`\`\`
Line 139:
\`\`\`ts
maxOutputTokens: 4096, // TODO: double check
\`\`\`

These values are used to show feature badges and output limit warnings in the model picker.

## Suggested fix
Cross-reference each model's official documentation and update:
- \`capabilities\` array with verified supported features
- \`maxOutputTokens\` with the correct value from the model's API docs or provider page
- Remove the \`// TODO\` comments once verified

## Acceptance criteria
- [ ] All models in \`llmMeta.ts\` have verified \`capabilities\` and \`maxOutputTokens\` values
- [ ] No \`// TODO\` or \`// double check\` comments remain in the file
- [ ] Model picker UI shows correct capability badges

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 14 created."

gh issue create \
  --repo "$REPO" \
  --title "Add per-chat custom system prompt UI" \
  --label "enhancement,help wanted,frontend,ux" \
  --body "## Description
The database schema already has a \`custom_system_prompt_suffix\` column on the \`chats\` table, and the \`PATCH /api/local/chats/{id}\` endpoint accepts it — but there is no UI to set it.

Adding a simple 'Custom instructions' field in the chat settings panel would let power users customize AI behavior per-conversation.

## Current state
- \`migrations/001_initial.sql\` — \`chats\` table has \`custom_system_prompt_suffix TEXT\`
- \`src-tauri/src/api/chats.rs\` — PATCH handler accepts the field
- \`src/components/chat/ChatInterface.tsx\` — no UI for it
- \`src/components/chat/input/ChatInputMenu.tsx\` — good candidate to add a 'System prompt' option

## Suggested approach
Add a 'Custom instructions' option to the \`ChatInputMenu\` (three-dot or gear menu in the chat input area):
- Opens a small modal/popover with a textarea
- On save: calls \`PATCH /api/local/chats/{id}\` with the new suffix
- Shows a small indicator badge when a custom prompt is active

## Acceptance criteria
- [ ] User can set/edit/clear a custom system prompt per chat
- [ ] Custom prompt is persisted in SQLite and survives app restart
- [ ] A small indicator (e.g. an icon) shows when a custom prompt is active for the current chat
- [ ] Works with both local and cloud models

## Resources
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 15 created."

gh issue create \
  --repo "$REPO" \
  --title "Add Playwright tests for local model download flow" \
  --label "testing,help wanted,local-llm" \
  --body "## Description
The local model download flow (catalog → download → progress bar → model ready) has no e2e test coverage. It is one of the most critical and complex user flows in KathaGPT.

## Current state
- \`test/e2e/\` — existing Playwright tests cover basic chat flows
- The local model API (\`POST /local-models/download\`, \`GET /local-models/progress\` SSE) has no test
- \`playwright.config.ts\` — config is set up and CI already runs it via \`.github/workflows/e2e.yml\`

## Suggested approach
Add a new test file \`test/e2e/local-models.spec.ts\`:

1. **Mock the download endpoints** — intercept \`/local-models/download\` and \`/local-models/progress\` with Playwright's \`route()\` to return controlled progress events (avoids downloading real GB-sized files in CI)
2. **Test catalog rendering** — assert the model list renders with name, size, and RAM badge
3. **Test download progress UI** — simulate SSE progress events and assert the progress bar updates
4. **Test error state** — return an error event and assert the error message is shown

## Acceptance criteria
- [ ] New \`test/e2e/local-models.spec.ts\` with mocked download flow
- [ ] Tests pass in \`pnpm test:e2e\` headless mode
- [ ] CI (\`.github/workflows/e2e.yml\`) continues to pass

## Resources
- [Playwright route mocking docs](https://playwright.dev/docs/network)
- [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md)"

echo "    Issue 16 created."

echo ""
echo "==> Done! All set up. Next steps:"
echo "    • Pin 2-3 issues from the Issues tab → 'Pin issue'"
echo "    • Enable GitHub Discussions: Settings → Features → Discussions"
echo "    • Record a demo GIF with Kap and add to docs/demo.gif"
echo "    • Post to r/LocalLLaMA and Hacker News Show HN"
