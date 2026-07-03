#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting KathaGPT Development Server..."

# Use Node 20+ (Vite 6 requires crypto.hash, available in Node >= 20.12)
node_meets_minimum() {
  local major minor
  major="$(node -p "process.versions.node.split('.')[0]")"
  minor="$(node -p "process.versions.node.split('.')[1]")"
  [ "$major" -gt 20 ] || { [ "$major" -eq 20 ] && [ "$minor" -ge 12 ]; }
}

if ! node_meets_minimum && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  if [ -f .nvmrc ]; then
    nvm install
    nvm use
  fi
fi

if ! node_meets_minimum; then
  echo "Error: Node.js >= 20.12 is required (current: $(node -v))."
  echo "Run: nvm install && nvm use"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  else
    npm install
  fi
fi

echo "Cleaning up existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:17890 | xargs kill -9 2>/dev/null || true
sleep 1

# Stale Vite dep cache causes "Failed to fetch dynamically imported module" in the browser
if [ -d node_modules/.vite ]; then
  echo "Clearing Vite cache..."
  rm -rf node_modules/.vite
fi

echo "Starting frontend (5173) and Rust API (17890)..."
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm run dev
else
  exec npm run dev
fi
