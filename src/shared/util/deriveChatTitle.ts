/** Mirrors Rust `derive_chat_title` in `src-tauri/src/db/repos/messages.rs`. */
export function deriveChatTitle(content: string): string {
  const trimmed = content.trim().split(/\s+/).filter(Boolean).join(" ");
  if (!trimmed) return "";
  const chars = [...trimmed];
  if (chars.length <= 48) return trimmed;
  return `${chars.slice(0, 48).join("")}…`;
}
