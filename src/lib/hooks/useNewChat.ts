import { useCallback } from "react";
import { useDraftChat } from "./useDraftChat";

export function useNewChat() {
  const { openDraftChat } = useDraftChat();

  const startNewChat = useCallback(async () => {
    await openDraftChat();
  }, [openDraftChat]);

  return { startNewChat, isPending: false };
}
