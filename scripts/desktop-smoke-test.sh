#!/usr/bin/env bash
# Smoke-test the built KathaGPT desktop app like a real user (API flows).
set -euo pipefail

APP="/Users/santoshpremiadhikari/Desktop/projects/KathGPT/src-tauri/target/release/bundle/macos/KathaGPT.app"
BASE_PORT=17890
MAX_PORT=17899
DEADLINE=$((SECONDS + 60))

discover_api() {
  while (( SECONDS < DEADLINE )); do
    for port in $(seq "$BASE_PORT" "$MAX_PORT"); do
      if curl -sf "http://127.0.0.1:${port}/api/local/health" >/dev/null 2>&1; then
        echo "$port"
        return 0
      fi
    done
    sleep 1
  done
  return 1
}

if [[ ! -d "$APP" ]]; then
  echo "FAIL: App bundle not found at $APP"
  exit 1
fi

echo "==> Launching KathaGPT.app"
open -a "$APP" || true

PORT=$(discover_api) || { echo "FAIL: API did not start within 60s"; exit 1; }
API="http://127.0.0.1:${PORT}/api/local"
echo "==> API ready on port $PORT"

echo "==> Health check"
curl -sf "$API/health" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['status']=='ok', d; print('  ok:', d)"

echo "==> User profile"
curl -sf "$API/user/me" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('email'), d; print('  user:', d.get('email'))"

echo "==> RAG document upload"
DOC_JSON=$(curl -sf -X POST "$API/documents/upload" \
  -H 'Content-Type: application/json' \
  -d "{\"filename\":\"smoke-test.txt\",\"data\":\"$(echo -n 'KathaGPT desktop smoke test. Project Aurora budget is 2.5 million.' | base64)\",\"mimeType\":\"text/plain\"}")
DOC_ID=$(echo "$DOC_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "  uploaded: $DOC_ID"

echo "==> RAG status (hybrid)"
curl -sf "$API/rag/status" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['searchMode']=='hybrid', d; print('  mode:', d['searchMode'], 'chunks:', d['totalChunks'])"

echo "==> Chat + RAG stream"
CHAT_ID="chat_smoke_$(date +%s)"
curl -sf -X POST "$API/chats" -H 'Content-Type: application/json' -d "{\"id\":\"$CHAT_ID\",\"name\":\"Smoke test\"}" >/dev/null

SSE=$(curl -s --max-time 120 -X POST "$API/chats/$CHAT_ID/messages/stream" \
  -H 'Content-Type: application/json' \
  -H 'Accept: text/event-stream' \
  -d "{\"content\":\"What is the Aurora project budget?\",\"attachmentIds\":[\"$DOC_ID\"]}" || true)

if [[ -z "$SSE" ]]; then
  echo "FAIL: empty stream response"
  exit 1
fi
if [[ "$SSE" != *"event: init"* ]]; then
  echo "FAIL: no init event"
  printf '%.500s\n' "$SSE"
  exit 1
fi
if [[ "$SSE" != *"ragSources"* ]]; then
  echo "FAIL: no ragSources in init"
  exit 1
fi
if [[ "$SSE" != *"event: done"* ]]; then
  echo "FAIL: no done event"
  exit 1
fi
echo "  stream: init + ragSources + done"

MSGS=$(curl -sf "$API/chats/$CHAT_ID/messages")
echo "$MSGS" | python3 -c "import sys,json; msgs=json.load(sys.stdin); ai=[m for m in msgs if m.get('fromAi')]; assert len(ai)>=1, msgs; assert len(ai[0].get('ragSources',[]))>0, ai[0]; print('  messages:', len(msgs), 'ragSources:', len(ai[0]['ragSources']))"

echo "==> All desktop smoke tests passed"
