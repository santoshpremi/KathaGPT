import {
  clearToolHistory,
  deleteToolHistoryEntry,
  loadToolHistory,
  saveToolHistoryEntry,
  updateToolHistoryEntry,
  type ToolHistoryBase,
} from "../tools/historyStorage";

export interface ImageHistoryEntry extends ToolHistoryBase {
  prompt: string;
  model: string;
  style: string;
  aspectRatio: string;
  images: string[];
}

const STORAGE_KEY = "kathagpt-image-history";

export function loadImageHistory(): ImageHistoryEntry[] {
  return loadToolHistory<ImageHistoryEntry>(STORAGE_KEY);
}

export function saveImageHistoryEntry(entry: ImageHistoryEntry) {
  return saveToolHistoryEntry(STORAGE_KEY, entry);
}

export function deleteImageHistoryEntry(id: string) {
  return deleteToolHistoryEntry<ImageHistoryEntry>(STORAGE_KEY, id);
}

export function clearImageHistory() {
  clearToolHistory(STORAGE_KEY);
}

export function renameImageHistoryEntry(id: string, name: string) {
  return updateToolHistoryEntry<ImageHistoryEntry>(STORAGE_KEY, id, { name });
}
