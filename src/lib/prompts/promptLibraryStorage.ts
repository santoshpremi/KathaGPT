import {
  deleteToolHistoryEntry,
  loadToolHistory,
  saveToolHistoryEntry,
  updateToolHistoryEntry,
  type ToolHistoryBase,
} from "../tools/historyStorage";

export interface SavedPrompt extends ToolHistoryBase {
  content: string;
  variables: string[];
}

const STORAGE_KEY = "kathagpt-prompt-library";

export function loadSavedPrompts(): SavedPrompt[] {
  return loadToolHistory<SavedPrompt>(STORAGE_KEY);
}

export function savePrompt(entry: SavedPrompt): SavedPrompt[] {
  return saveToolHistoryEntry(STORAGE_KEY, entry);
}

export function updatePrompt(id: string, patch: Partial<SavedPrompt>): SavedPrompt[] {
  return updateToolHistoryEntry<SavedPrompt>(STORAGE_KEY, id, patch);
}

export function deletePrompt(id: string): SavedPrompt[] {
  return deleteToolHistoryEntry<SavedPrompt>(STORAGE_KEY, id);
}
