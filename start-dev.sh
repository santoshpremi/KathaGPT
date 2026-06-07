#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting KathaGPT Development Server..."

# Use Node 20+ (Vite 6 requires crypto.hash, available in Node >= 20.12)
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  if [ -f .nvmrc ]; then
    nvm use
  fi
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
NODE_MINOR="$(node -p "process.versions.node.split('.')[1]")"
if [ "$NODE_MAJOR" -lt 20 ] || { [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 12 ]; }; then
  echo "Error: Node.js >= 20.12 is required (current: $(node -v))."
  echo "Run: nvm install 20 && nvm use 20"
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
