import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOneTimeInfoModalStore = create(
  persist<{
    closedIds: string[];
    onModalClose: (id: string) => void;
  }>(
    (set) => ({
      closedIds: [],
      onModalClose: (id) =>
        set((state) => ({ closedIds: [...state.closedIds, id] })),
    }),
    {
      name: "one-time-info-modals",
    },
  ),
);

export function useOneTimeInfoModal(id: string) {
  const { closedIds, onModalClose } = useOneTimeInfoModalStore();
  return {
    onModalClose: () => onModalClose(id),
    closed: closedIds.includes(id),
  };
}
