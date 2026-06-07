import { create } from "zustand";
import type { ModelOverride } from "@backend/api/chat/chatTypes";
import { type DocumentOutputFormat } from "@backend/document/documentTypes";

interface QueuedMessage {
  content: string;
  chatId: string;
  attachmentIds?: string[];
  ragMode?: boolean;
  modelOverride?: ModelOverride;
  outputFormat?: DocumentOutputFormat | null;
  workflowExecutionId?: string;
}

interface QueuedMessagesStore {
  queuedMessages: QueuedMessage[];
  addQueuedMessage: (message: QueuedMessage) => void;
  shiftQueuedMessage: () => void;
  clear: () => void;
}

export const useQueuedMessagesStore = create<QueuedMessagesStore>((set) => ({
  queuedMessages: [],
  addQueuedMessage: (message) =>
    set((state) => ({
      queuedMessages: [...state.queuedMessages, message],
    })),
  shiftQueuedMessage: () =>
    set((state) => {
      const [, ...rest] = state.queuedMessages;
      return {
        queuedMessages: rest,
      };
    }),
  clear: () => set({ queuedMessages: [] }),
}));
