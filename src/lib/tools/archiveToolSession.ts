import { v4 as uuidv4 } from "uuid";
import { historyDisplayName } from "./historyStorage";
import {
  loadImageHistory,
  saveImageHistoryEntry,
  type ImageHistoryEntry,
} from "../imageGenerator/history";
import {
  loadTranslatorHistory,
  saveTranslatorHistoryEntry,
  type TranslatorHistoryEntry,
} from "./translatorHistory";
import {
  loadResearchHistory,
  saveResearchHistoryEntry,
  type ResearchHistoryEntry,
} from "./researchHistory";
import {
  loadMeetingHistory,
  saveMeetingHistoryEntry,
  type MeetingHistoryEntry,
} from "./meetingHistory";
import {
  useToolSessionStore,
  type ImageToolSession,
  type MeetingToolSession,
  type ResearchToolSession,
  type TranslatorToolSession,
} from "./toolSessionStore";

const untitled = "Untitled";

export function imageSessionFingerprint(
  session: ImageToolSession | null,
): string {
  if (!session) return "";
  return JSON.stringify({
    modelId: session.modelId,
    style: session.style,
    prompt: session.prompt.trim(),
    aspect: session.aspect,
    count: session.count,
    results: session.results,
  });
}

export function imageEntryFingerprint(entry: ImageHistoryEntry): string {
  return JSON.stringify({
    modelId: entry.model,
    style: entry.style,
    prompt: entry.prompt.trim(),
    aspect: entry.aspectRatio,
    count: entry.images.length,
    results: entry.images,
  });
}

export function translatorSessionFingerprint(
  session: TranslatorToolSession | null,
): string {
  if (!session) return "";
  return JSON.stringify({
    sourceLang: session.sourceLang,
    targetLang: session.targetLang,
    sourceText: session.sourceText.trim(),
    targetText: session.targetText.trim(),
  });
}

export function translatorEntryFingerprint(
  entry: TranslatorHistoryEntry,
): string {
  return JSON.stringify({
    sourceLang: entry.sourceLang,
    targetLang: entry.targetLang,
    sourceText: entry.sourceText.trim(),
    targetText: entry.targetText.trim(),
  });
}

export function researchSessionFingerprint(
  session: ResearchToolSession | null,
): string {
  if (!session) return "";
  const turns = session.turns
    .filter((turn) => turn.content)
    .map((turn) => ({
      query: turn.query,
      content: turn.content,
      citations: turn.citations,
      citedIndices: turn.citedIndices,
    }));
  return JSON.stringify({ modelId: session.modelId, turns });
}

export function researchEntryFingerprint(entry: ResearchHistoryEntry): string {
  return JSON.stringify({
    modelId: entry.model,
    turns: entry.turns.map((turn) => ({
      query: turn.query,
      content: turn.content,
      citations: turn.citations,
      citedIndices: turn.citedIndices,
    })),
  });
}

export function meetingSessionFingerprint(
  session: MeetingToolSession | null,
): string {
  if (!session) return "";
  return JSON.stringify({
    notes: session.notes.trim(),
    action: session.lastAction,
  });
}

export function meetingEntryFingerprint(entry: MeetingHistoryEntry): string {
  return JSON.stringify({
    notes: entry.notes.trim(),
    action: entry.action,
  });
}

function markArchived(
  tool: "image" | "translator" | "research" | "meeting",
  fingerprint: string,
) {
  const state = useToolSessionStore.getState();
  switch (tool) {
    case "image":
      state.setImageBaseline(fingerprint);
      state.setImageDirty(false);
      break;
    case "translator":
      state.setTranslatorBaseline(fingerprint);
      state.setTranslatorDirty(false);
      break;
    case "research":
      state.setResearchBaseline(fingerprint);
      state.setResearchDirty(false);
      break;
    case "meeting":
      state.setMeetingBaseline(fingerprint);
      state.setMeetingDirty(false);
      break;
  }
}

export function imageSessionHasContent(session: ImageToolSession | null): boolean {
  return Boolean(session?.prompt.trim() || session?.results.length);
}

const MIN_TRANSLATOR_ARCHIVE_CHARS = 4;

export function translatorSessionHasContent(
  session: TranslatorToolSession | null,
): boolean {
  const source = session?.sourceText.trim() ?? "";
  const target = session?.targetText.trim() ?? "";
  return (
    source.length >= MIN_TRANSLATOR_ARCHIVE_CHARS ||
    target.length >= MIN_TRANSLATOR_ARCHIVE_CHARS
  );
}

export function researchSessionHasContent(
  session: ResearchToolSession | null,
): boolean {
  return Boolean(
    session?.turns.some((turn) => turn.content) || session?.query.trim(),
  );
}

export function meetingSessionHasContent(
  session: MeetingToolSession | null,
): boolean {
  return Boolean(session?.notes.trim());
}

export function archiveImageSession(
  session: ImageToolSession | null,
): ImageHistoryEntry | null {
  if (!imageSessionHasContent(session) || !session) return null;
  const fingerprint = imageSessionFingerprint(session);
  const latest = loadImageHistory()[0];
  if (latest && imageEntryFingerprint(latest) === fingerprint) {
    markArchived("image", fingerprint);
    return latest;
  }
  const saved = saveImageHistoryEntry({
    id: uuidv4(),
    name: historyDisplayName(undefined, session.prompt.trim(), untitled),
    prompt: session.prompt.trim(),
    model: session.modelId,
    style: session.style,
    aspectRatio: session.aspect,
    images: session.results,
    createdAt: new Date().toISOString(),
  })[0];
  markArchived("image", fingerprint);
  return saved;
}

export function archiveTranslatorSession(
  session: TranslatorToolSession | null,
): TranslatorHistoryEntry | null {
  if (!translatorSessionHasContent(session) || !session) return null;
  const fingerprint = translatorSessionFingerprint(session);
  const latest = loadTranslatorHistory()[0];
  if (latest && translatorEntryFingerprint(latest) === fingerprint) {
    markArchived("translator", fingerprint);
    return latest;
  }
  const saved = saveTranslatorHistoryEntry({
    id: uuidv4(),
    name: historyDisplayName(undefined, session.sourceText.trim(), untitled),
    sourceLang: session.sourceLang,
    targetLang: session.targetLang,
    sourceText: session.sourceText.trim(),
    targetText: session.targetText.trim(),
    createdAt: new Date().toISOString(),
  })[0];
  markArchived("translator", fingerprint);
  return saved;
}

export function archiveResearchSession(
  session: ResearchToolSession | null,
): ResearchHistoryEntry | null {
  if (!session) return null;
  const completedTurns = session.turns
    .filter((turn) => turn.content)
    .map((turn) => ({
      query: turn.query,
      content: turn.content,
      citations: turn.citations,
      searchResults: turn.searchResults,
      citedIndices: turn.citedIndices,
    }));
  if (completedTurns.length === 0) return null;
  const fingerprint = researchSessionFingerprint(session);
  const latest = loadResearchHistory()[0];
  if (latest && researchEntryFingerprint(latest) === fingerprint) {
    markArchived("research", fingerprint);
    return latest;
  }
  const saved = saveResearchHistoryEntry({
    id: uuidv4(),
    name: historyDisplayName(undefined, completedTurns[0]?.query ?? "", untitled),
    model: session.modelId,
    createdAt: new Date().toISOString(),
    turns: completedTurns,
  })[0];
  markArchived("research", fingerprint);
  return saved;
}

export function archiveMeetingSession(
  session: MeetingToolSession | null,
): MeetingHistoryEntry | null {
  if (!meetingSessionHasContent(session) || !session) return null;
  const fingerprint = meetingSessionFingerprint(session);
  const latest = loadMeetingHistory()[0];
  if (latest && meetingEntryFingerprint(latest) === fingerprint) {
    markArchived("meeting", fingerprint);
    return latest;
  }
  const saved = saveMeetingHistoryEntry({
    id: uuidv4(),
    name: historyDisplayName(undefined, session.notes.trim(), untitled),
    notes: session.notes.trim(),
    action: session.lastAction,
    createdAt: new Date().toISOString(),
  })[0];
  markArchived("meeting", fingerprint);
  return saved;
}

/** Archive every tool session that has unsaved changes (app close). */
export function archiveDirtyToolSessions(): boolean {
  const state = useToolSessionStore.getState();
  let saved = false;

  if (state.imageDirty && imageSessionHasContent(state.image)) {
    archiveImageSession(state.image);
    saved = true;
  }
  if (state.translatorDirty && translatorSessionHasContent(state.translator)) {
    archiveTranslatorSession(state.translator);
    saved = true;
  }
  if (state.researchDirty && researchSessionHasContent(state.research)) {
    archiveResearchSession(state.research);
    saved = true;
  }
  if (state.meetingDirty && meetingSessionHasContent(state.meeting)) {
    archiveMeetingSession(state.meeting);
    saved = true;
  }

  return saved;
}
