import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DraftChatStore {
  draftIds: string[];
  markDraft: (chatId: string) => void;
  clearDraft: (chatId: string) => void;
  isDraft: (chatId: string) => boolean;
}

export const useDraftChatStore = create(
  persist<DraftChatStore>(
    (set, get) => ({
      draftIds: [],
      markDraft: (chatId) =>
        set((state) => ({
          draftIds: state.draftIds.includes(chatId)
            ? state.draftIds
            : [...state.draftIds, chatId],
        })),
      clearDraft: (chatId) =>
        set((state) => ({
          draftIds: state.draftIds.filter((id) => id !== chatId),
        })),
      isDraft: (chatId) => get().draftIds.includes(chatId),
    }),
    {
      name: "kathagpt-draft-chats",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
