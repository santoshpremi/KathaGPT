#!/bin/bash
# KathaGPT macOS installer — works with any downloaded DMG.
# Searches ~/Downloads, ~/Desktop, and ~ for the newest KathaGPT*.dmg.
# Usage:
#   bash install-macos.sh                   (auto-find DMG)
#   bash install-macos.sh ~/path/to/file.dmg  (explicit path)
set -euo pipefail

APP_NAME="KathaGPT.app"
INSTALL_DIR="/Applications"

# ── find the newest KathaGPT DMG in common locations ─────────────────────────
find_dmg() {
  local dmg
  # Search Downloads, Desktop, home root — handles renamed copies like (1), (2)
  dmg=$(find "$HOME/Downloads" "$HOME/Desktop" "$HOME" \
        -maxdepth 2 -name "KathaGPT*.dmg" 2>/dev/null \
        | sort -V | tail -1 || true)

  if [[ -n "$dmg" && -f "$dmg" ]]; then
    echo "$dmg"
    return
  fi

  echo "No KathaGPT DMG found in ~/Downloads, ~/Desktop, or ~." >&2
  echo "Pass the path explicitly:" >&2
  echo "  bash install-macos.sh ~/path/to/KathaGPT_0.1.0_aarch64.dmg" >&2
  exit 1
}

DMG_PATH="${1:-$(find_dmg)}"
echo "Using: $DMG_PATH"

# ── mount ─────────────────────────────────────────────────────────────────────
MOUNT_OUTPUT=$(hdiutil attach "$DMG_PATH" -nobrowse -readonly)
VOLUME=$(echo "$MOUNT_OUTPUT" | awk '/\/Volumes\// {print $NF; exit}')

if [[ ! -d "$VOLUME/$APP_NAME" ]]; then
  hdiutil detach "$VOLUME" -quiet 2>/dev/null || true
  echo "Error: $APP_NAME not found in $DMG_PATH" >&2
  exit 1
fi

# ── install ───────────────────────────────────────────────────────────────────
echo "Installing to $INSTALL_DIR ..."
rm -rf "$INSTALL_DIR/$APP_NAME"
ditto "$VOLUME/$APP_NAME" "$INSTALL_DIR/$APP_NAME"
xattr -cr "$INSTALL_DIR/$APP_NAME"
hdiutil detach "$VOLUME" -quiet

echo "Launching KathaGPT ..."
open "$INSTALL_DIR/$APP_NAME"
