import type { SearchResultItem } from "../api/rust/research";
import {
  clearToolHistory,
  deleteToolHistoryEntry,
  loadToolHistory,
  saveToolHistoryEntry,
  updateToolHistoryEntry,
  type ToolHistoryBase,
} from "./historyStorage";

export interface ResearchHistoryTurn {
  query: string;
  content: string;
  citations: string[];
  searchResults: SearchResultItem[];
  citedIndices: number[];
}

export interface ResearchHistoryEntry extends ToolHistoryBase {
  model: string;
  turns: ResearchHistoryTurn[];
}

const STORAGE_KEY = "kathgpt-research-history";

export function loadResearchHistory() {
  return loadToolHistory<ResearchHistoryEntry>(STORAGE_KEY);
}

export function saveResearchHistoryEntry(entry: ResearchHistoryEntry) {
  return saveToolHistoryEntry(STORAGE_KEY, entry);
}

export function deleteResearchHistoryEntry(id: string) {
  return deleteToolHistoryEntry<ResearchHistoryEntry>(STORAGE_KEY, id);
}

export function clearResearchHistory() {
  clearToolHistory(STORAGE_KEY);
}

export function renameResearchHistoryEntry(id: string, name: string) {
  return updateToolHistoryEntry<ResearchHistoryEntry>(STORAGE_KEY, id, {
    name,
  });
}
