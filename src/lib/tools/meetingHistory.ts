import {
  clearToolHistory,
  deleteToolHistoryEntry,
  loadToolHistory,
  saveToolHistoryEntry,
  updateToolHistoryEntry,
  type ToolHistoryBase,
} from "./historyStorage";

export type MeetingAction = "summarize" | "action-items";

export interface MeetingHistoryEntry extends ToolHistoryBase {
  notes: string;
  action: MeetingAction;
}

const STORAGE_KEY = "kathagpt-meeting-history";

export function loadMeetingHistory() {
  return loadToolHistory<MeetingHistoryEntry>(STORAGE_KEY);
}

export function saveMeetingHistoryEntry(entry: MeetingHistoryEntry) {
  return saveToolHistoryEntry(STORAGE_KEY, entry);
}

export function deleteMeetingHistoryEntry(id: string) {
  return deleteToolHistoryEntry<MeetingHistoryEntry>(STORAGE_KEY, id);
}

export function clearMeetingHistory() {
  clearToolHistory(STORAGE_KEY);
}

export function renameMeetingHistoryEntry(id: string, name: string) {
  return updateToolHistoryEntry<MeetingHistoryEntry>(STORAGE_KEY, id, { name });
}
