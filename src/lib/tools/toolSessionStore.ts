import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SearchResultItem } from "../api/rust/research";
import type { MeetingAction } from "./meetingHistory";

export interface ImageToolSession {
  modelId: string;
  style: string;
  prompt: string;
  aspect: string;
  count: number;
  results: string[];
  activeTabId: string | null;
}

export interface TranslatorToolSession {
  tab: number;
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  targetText: string;
  activeTabId: string | null;
}

export interface ResearchTurnSession {
  id: string;
  query: string;
  content: string;
  citations: string[];
  searchResults: SearchResultItem[];
  citedIndices: number[];
}

export interface ResearchToolSession {
  modelId: string;
  query: string;
  turns: ResearchTurnSession[];
  activeTabId: string | null;
}

export interface MeetingToolSession {
  notes: string;
  lastAction: MeetingAction;
  activeTabId: string | null;
}

interface ToolSessionStore {
  image: ImageToolSession | null;
  translator: TranslatorToolSession | null;
  research: ResearchToolSession | null;
  meeting: MeetingToolSession | null;
  imageDirty: boolean;
  translatorDirty: boolean;
  researchDirty: boolean;
  meetingDirty: boolean;
  /** Fingerprint of the last archived or loaded-from-history snapshot per tool. */
  imageBaseline: string | null;
  translatorBaseline: string | null;
  researchBaseline: string | null;
  meetingBaseline: string | null;
  setImage: (session: ImageToolSession | null) => void;
  setTranslator: (session: TranslatorToolSession | null) => void;
  setResearch: (session: ResearchToolSession | null) => void;
  setMeeting: (session: MeetingToolSession | null) => void;
  setImageDirty: (dirty: boolean) => void;
  setTranslatorDirty: (dirty: boolean) => void;
  setResearchDirty: (dirty: boolean) => void;
  setMeetingDirty: (dirty: boolean) => void;
  setImageBaseline: (baseline: string | null) => void;
  setTranslatorBaseline: (baseline: string | null) => void;
  setResearchBaseline: (baseline: string | null) => void;
  setMeetingBaseline: (baseline: string | null) => void;
  resetImage: () => void;
  resetTranslator: () => void;
  resetResearch: () => void;
  resetMeeting: () => void;
}

export const useToolSessionStore = create(
  persist<ToolSessionStore>(
    (set) => ({
      image: null,
      translator: null,
      research: null,
      meeting: null,
      imageDirty: false,
      translatorDirty: false,
      researchDirty: false,
      meetingDirty: false,
      imageBaseline: null,
      translatorBaseline: null,
      researchBaseline: null,
      meetingBaseline: null,
      setImage: (image) => set({ image }),
      setTranslator: (translator) => set({ translator }),
      setResearch: (research) => set({ research }),
      setMeeting: (meeting) => set({ meeting }),
      setImageDirty: (imageDirty) => set({ imageDirty }),
      setTranslatorDirty: (translatorDirty) => set({ translatorDirty }),
      setResearchDirty: (researchDirty) => set({ researchDirty }),
      setMeetingDirty: (meetingDirty) => set({ meetingDirty }),
      setImageBaseline: (imageBaseline) => set({ imageBaseline }),
      setTranslatorBaseline: (translatorBaseline) => set({ translatorBaseline }),
      setResearchBaseline: (researchBaseline) => set({ researchBaseline }),
      setMeetingBaseline: (meetingBaseline) => set({ meetingBaseline }),
      resetImage: () =>
        set({ image: null, imageDirty: false, imageBaseline: null }),
      resetTranslator: () =>
        set({ translator: null, translatorDirty: false, translatorBaseline: null }),
      resetResearch: () =>
        set({ research: null, researchDirty: false, researchBaseline: null }),
      resetMeeting: () =>
        set({ meeting: null, meetingDirty: false, meetingBaseline: null }),
    }),
    {
      name: "kathagpt-tool-sessions",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        image: state.image,
        translator: state.translator,
        research: state.research,
        meeting: state.meeting,
        imageDirty: state.imageDirty,
        translatorDirty: state.translatorDirty,
        researchDirty: state.researchDirty,
        meetingDirty: state.meetingDirty,
        imageBaseline: state.imageBaseline,
        translatorBaseline: state.translatorBaseline,
        researchBaseline: state.researchBaseline,
        meetingBaseline: state.meetingBaseline,
      }),
    },
  ),
);
