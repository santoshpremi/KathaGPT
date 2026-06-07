import {
  clearToolHistory,
  deleteToolHistoryEntry,
  loadToolHistory,
  saveToolHistoryEntry,
  updateToolHistoryEntry,
  type ToolHistoryBase,
} from "./historyStorage";

export interface TranslatorHistoryEntry extends ToolHistoryBase {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  targetText: string;
}

const STORAGE_KEY = "kathagpt-translator-history";

export function loadTranslatorHistory() {
  return loadToolHistory<TranslatorHistoryEntry>(STORAGE_KEY);
}

export function saveTranslatorHistoryEntry(entry: TranslatorHistoryEntry) {
  return saveToolHistoryEntry(STORAGE_KEY, entry);
}

export function deleteTranslatorHistoryEntry(id: string) {
  return deleteToolHistoryEntry<TranslatorHistoryEntry>(STORAGE_KEY, id);
}

export function clearTranslatorHistory() {
  clearToolHistory(STORAGE_KEY);
}

export function renameTranslatorHistoryEntry(id: string, name: string) {
  return updateToolHistoryEntry<TranslatorHistoryEntry>(STORAGE_KEY, id, {
    name,
  });
}
