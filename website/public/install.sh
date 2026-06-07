#!/bin/bash
# KathaGPT one-line installer for macOS.
# Usage:  curl -fsSL https://santoshpremi.github.io/KathaGPT/install.sh | bash
set -euo pipefail

VERSION="0.1.0"
APP_NAME="KathaGPT.app"
INSTALL_DIR="/Applications"
BASE_URL="https://santoshpremi.github.io/KathaGPT/downloads"

# ── detect architecture ────────────────────────────────────────────────────────
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
  DMG="KathaGPT_${VERSION}_aarch64.dmg"
else
  DMG="KathaGPT_${VERSION}_x64.dmg"
fi

echo "KathaGPT installer — macOS ${ARCH}"
echo ""

# ── download to a temp folder (no naming conflicts, any browser) ──────────────
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "Downloading $DMG ..."
curl -L --progress-bar -o "$TMP/$DMG" "$BASE_URL/$DMG"

# ── mount, copy, clear quarantine, eject ─────────────────────────────────────
echo "Mounting disk image ..."
MOUNT_OUTPUT=$(hdiutil attach "$TMP/$DMG" -nobrowse -readonly)
VOLUME=$(echo "$MOUNT_OUTPUT" | awk '/\/Volumes\// {print $NF; exit}')

if [[ ! -d "$VOLUME/$APP_NAME" ]]; then
  hdiutil detach "$VOLUME" -quiet 2>/dev/null || true
  echo "Error: $APP_NAME not found in the disk image." >&2
  exit 1
fi

echo "Installing to $INSTALL_DIR ..."
rm -rf "$INSTALL_DIR/$APP_NAME"
ditto "$VOLUME/$APP_NAME" "$INSTALL_DIR/$APP_NAME"
xattr -cr "$INSTALL_DIR/$APP_NAME"
hdiutil detach "$VOLUME" -quiet

echo ""
echo "Done!  Opening KathaGPT ..."
open "$INSTALL_DIR/$APP_NAME"
