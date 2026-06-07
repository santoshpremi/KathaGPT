const MAX_ENTRIES = 50;

export interface ToolHistoryBase {
  id: string;
  createdAt: string;
  name?: string;
}

export function loadToolHistory<T extends ToolHistoryBase>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToolHistoryEntry<T extends ToolHistoryBase>(
  key: string,
  entry: T,
): T[] {
  const existing = loadToolHistory<T>(key);
  const next = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(
    0,
    MAX_ENTRIES,
  );
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function updateToolHistoryEntry<T extends ToolHistoryBase>(
  key: string,
  id: string,
  patch: Partial<T>,
): T[] {
  const next = loadToolHistory<T>(key).map((entry) =>
    entry.id === id ? { ...entry, ...patch } : entry,
  );
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function deleteToolHistoryEntry<T extends ToolHistoryBase>(
  key: string,
  id: string,
): T[] {
  const next = loadToolHistory<T>(key).filter((e) => e.id !== id);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function clearToolHistory(key: string) {
  localStorage.removeItem(key);
}

export function historyDisplayName(
  name: string | undefined,
  fallback: string,
  untitled: string,
): string {
  const trimmed = name?.trim() || fallback.trim();
  return trimmed || untitled;
}
